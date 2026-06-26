import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
    });

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

function succeeds(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "ignore",
      shell: false,
    });

    child.once("error", () => resolve(false));
    child.once("exit", (code) => resolve(code === 0));
  });
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function encryptVideo(
  slug: string,
  videoPath: string,
  outputDir: string,
): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  const keyPath = path.join(outputDir, "key.bin");
  const keyInfoPath = path.join(outputDir, "key.keyinfo");
  const playlistPath = path.join(outputDir, "playlist.m3u8");
  const key = randomBytes(16);

  await writeFile(keyPath, key);
  await writeFile(keyInfoPath, `key.bin\n${keyPath}\n`);

  console.log(`Encrypting ${videoPath}`);
  await run("ffmpeg", [
    "-y",
    "-i",
    videoPath,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "22",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-hls_time",
    "6",
    "-hls_playlist_type",
    "vod",
    "-hls_key_info_file",
    keyInfoPath,
    "-hls_segment_filename",
    path.join(outputDir, "seg-%05d.ts"),
    playlistPath,
  ]);

  const playlist = await readFile(playlistPath, "utf8");
  await writeFile(
    playlistPath,
    playlist.replace(/URI="[^"]*"/g, 'URI="key"'),
  );

  console.log(`Encrypted lecture ${slug}`);
}

async function main(): Promise<void> {
  const slug = process.argv[2];
  const videoPath = process.argv[3];
  const repo = process.env.GITHUB_VAULT_REPO;

  if (!slug || !videoPath) {
    throw new Error(
      "Usage: npm run upload-lecture -- <slug> <path-to-video.mp4>",
    );
  }
  if (!repo) {
    throw new Error("GITHUB_VAULT_REPO is required");
  }
  if (!(await exists(videoPath))) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  const outputDir = path.join(
    process.cwd(),
    "private",
    "lectures",
    slug,
  );
  await encryptVideo(slug, videoPath, outputDir);

  const key = await readFile(path.join(outputDir, "key.bin"));
  if (key.length !== 16) {
    throw new Error(`Expected a 16-byte AES key, received ${key.length}`);
  }

  const files = (await readdir(outputDir))
    .filter((name) => name === "playlist.m3u8" || /^seg-\d+\.ts$/.test(name))
    .sort()
    .map((name) => path.join(outputDir, name));

  if (!(await succeeds("gh", ["repo", "view", repo]))) {
    throw new Error(`GitHub repository not found: ${repo}`);
  }

  if (
    !(await succeeds("gh", [
      "release",
      "view",
      slug,
      "--repo",
      repo,
    ]))
  ) {
    await run("gh", [
      "release",
      "create",
      slug,
      "--repo",
      repo,
      "--title",
      `Lecture ${slug}`,
      "--notes",
      `Encrypted Project Spark lecture bundle for ${slug}.`,
    ]);
  }

  const batchSize = 30;
  for (let index = 0; index < files.length; index += batchSize) {
    const batch = files.slice(index, index + batchSize);
    console.log(
      `Uploading batch ${Math.floor(index / batchSize) + 1}/${Math.ceil(files.length / batchSize)}`,
    );
    await run("gh", [
      "release",
      "upload",
      slug,
      ...batch,
      "--repo",
      repo,
      "--clobber",
    ]);
  }

  console.log(`LECTURE_KEY=${key.toString("hex")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
