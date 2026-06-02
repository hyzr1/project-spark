(() => {
  "use strict";

  window.createCleanSceneRenderer = function createCleanSceneRenderer(canvas, options = {}) {
  if (!canvas) {
    throw new Error("Clean scene renderer needs a canvas.");
  }

  const boundsElement = options.boundsElement || canvas;
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    throw new Error("This animation needs WebGL 2.");
  }

  const ARTBOARD = [1440, 900];
  const DPR_LIMIT = 1;
  const DEBUG_VIEW = new URLSearchParams(window.location.search).get("debug");
  const CONFIG = {
    // Output tint. Accepts 0-1 RGB or 0-255 RGB.
    color: [25, 25, 25],
    // Brightness multiplier after the RGB color is applied.
    colorAmount: 10.0,
    // 0 uses the exact RGB color; 1 washes it toward white.
    whiteAmount: 0.0,

    // Cursor pull settings. Radius is in normalized screen space.
    cursorRadius: 0.5,
    cursorPullStrength: 3.0,

    // Speed multiplier: 0 freezes, 0.5 is slow, 1 is normal, 2 is fast.
    backgroundParticleSpeed: 0.5,
  };
  Object.assign(CONFIG, options.config || {});
  window.cleanSceneSettings = CONFIG;
  const SHADERS = {
  "wisps": "#version 300 es\n\nprecision highp float;in vec3 vVertexPosition;\nin vec2 vTextureCoord;\nuniform sampler2D uTexture;\nuniform float uTime;\nuniform vec2 uMousePos;\nuniform vec2 uResolution;\nvec3 blend (int blendMode, vec3 src, vec3 dst) {\nreturn src + dst;\n}out vec4 fragColor;\nconst float PI = 3.14159265359;\nmat2 rot(float a) {\nreturn mat2(cos(a),-sin(a),sin(a),cos(a));\n}vec2 hash(vec2 p) {\np = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));\nreturn -1.0 + 2.0 * fract(sin(p) * 43758.5453123);\n}float luma(vec3 color) {\nreturn dot(color, vec3(0.299, 0.587, 0.114));\n}float getAttractionFalloff(float startFalloff, float endFalloff, float attractionRange) {\nfloat rangeT = attractionRange * 1.5;\nfloat startRadius = 1.0 / max(startFalloff, 0.0001);\nfloat endRadius = 1.0 / max(endFalloff, 0.0001);\nfloat attractionRadius = mix(startRadius, endRadius, rangeT);\nreturn 1.0 / max(attractionRadius, 0.0001);\n}float starCross(vec2 diff, float radius) {\nvec2 ad = abs(diff);\nfloat width = mix(0.012, 0.035, clamp(radius, 0.0, 1.0));\nfloat length = mix(0.25, 1.35, 0.0000);\nfloat axisDist = min(ad.x, ad.y);\nfloat armDist = max(ad.x, ad.y);\nfloat axis = 1.0 - smoothstep(width, width * 3.0, axisDist);\nfloat fade = 1.0 - smoothstep(0.05, length, armDist);\nreturn axis * fade * radius * 0.0000 * 3.0;\n}float voronoi_additive(vec2 st, float radius, vec2 mouse_pos, float scale, float wanderVal, float time, float attraction, float attractionRange, float shimmerVal, float glowVal) {\nvec2 i_st = floor(st);\nfloat wander = wanderVal * time * 0.2;\nfloat total_contribution = 0.0;\nfloat minDistSq = max(radius * radius * 0.01, 0.0001);\nfloat attractionFalloff = getAttractionFalloff(0.5 + scale * 2.0, 0.5, attractionRange);\nfloat attractionFalloffSq = attractionFalloff * attractionFalloff;\nfloat timePhase = time * 0.12;\nbool useAttraction = attraction != 0.0;\nbool useShimmer = shimmerVal > 0.0;\nbool useCross = 0.0000 > 0.0;for (int y = -1; y <= 1; y++) {\nfor (int x = -1; x <= 1; x++) {\nvec2 neighbor = vec2(float(x), float(y));\nvec2 cell_id = i_st + neighbor;\nvec2 hashValue = hash(cell_id);\nvec2 point = 0.5 + 0.5 * sin(5.0 + wander + 6.2831 * hashValue);\nvec2 starAbsPos = cell_id + point;\nif (useAttraction) {\nvec2 dirToMouse = mouse_pos - starAbsPos;\nfloat distToMouseSq = dot(dirToMouse, dirToMouse);\nfloat attractStrength = attraction * 2.0 / (1.0 + distToMouseSq * attractionFalloffSq * 8.0);\nstarAbsPos += dirToMouse * attractStrength;\n}\nvec2 diff = starAbsPos - st;\nfloat distSq = dot(diff, diff);\nfloat contribution = radius * inversesqrt(max(distSq, minDistSq));\ncontribution *= 1.0 - smoothstep(2.25, 5.76, distSq);\nif (useCross) {\ncontribution += starCross(diff, radius);\n}\nif (useShimmer) {\nfloat shimmerPhase = point.x + point.y + hashValue.x * 0.5 + timePhase;\nfloat shimmer = 1.0 - abs(fract(shimmerPhase) * 2.0 - 1.0);\nshimmer = mix(1.0, 0.75 + shimmer, shimmerVal);\ncontribution *= shimmer;\n}total_contribution += mix(contribution*contribution, contribution * 2., glowVal);\n}\n}return total_contribution;\n}vec4 randomStyle(vec4 bg, vec2 uv) {\nvec4 color = vec4(0.0);\nvec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);\nfloat angle = 0.0000 * 2.0 * PI;\nmat2 rotation = rot(angle);\nfloat baseScale = 40.0 * 0.8200;\nvec2 skewScale = vec2(1.0, 1.0 - 0.0000);\nfloat movementY = uTime * 0.0000 * -0.05;\nvec2 movementOffset = vec2(0.0, movementY);vec2 mPos = mix(vec2(0.0), (uMousePos - 0.5), 0.0000);uv -= vec2(0.5, 0.5);\nuv *= aspectRatio;\nuv *= rotation;\nuv *= baseScale;\nuv *= skewScale;\nuv /= aspectRatio;mPos *= rotation;vec2 mouseGrid = uMousePos;\nmouseGrid -= vec2(0.5, 0.5);\nmouseGrid *= aspectRatio;\nmouseGrid *= rotation;\nmouseGrid *= baseScale;\nmouseGrid *= skewScale;\nmouseGrid /= aspectRatio;float passScale1 = 38.0 * 0.8200;\nfloat passScale2 = 48.0 * 0.8200;\nvec2 mouseGrid1 = mouseGrid - (mPos * passScale1) + movementOffset;\nvec2 mouseGrid2 = mouseGrid - (mPos * passScale2) + movementOffset;vec2 st1 = uv - (mPos * passScale1);\nvec2 st2 = uv - (mPos * passScale2);vec2 mouse1 = st1 + movementOffset;\nvec2 mouse2 = st2 + movementOffset;float radius1 = 0.5 * 0.4700;\nfloat radius2 = 0.5 * 0.4700;float pass1 = voronoi_additive(mouse1 * aspectRatio, radius1, mouseGrid1 * aspectRatio, passScale1, 0.0000, uTime, 0.0000, 0.5000, 0.5000, 0.2500);\nfloat secondPassWeight = smoothstep(0.18, 0.4, 0.8200);\nfloat pass2 = 0.0;\nif (secondPassWeight > 0.0) {\npass2 = voronoi_additive(mouse2 * aspectRatio + vec2(10.0), radius2, mouseGrid2 * aspectRatio + vec2(10.0), passScale2, 0.0000, uTime, 0.0000, 0.5000, 0.5000, 0.2500);\n}pass1 *= 0.02;\npass2 *= 0.04 * secondPassWeight;color.rgb = (pass1 + pass2) * vec3(0.3686274509803922, 0.3686274509803922, 0.3686274509803922) * mix(1.0, bg.r, 0.0000);\ncolor.rgb = clamp(color.rgb, 0.0, 1.0);color.rgb = blend(1, bg.rgb, color.rgb);color = vec4(color.rgb, max(bg.a, luma(color.rgb)));\nreturn color;\n}void main() {\nvec2 uv = vTextureCoord;\nvec4 bg = texture(uTexture, uv);\nvec4 color;color = randomStyle(bg, uv);\nfragColor = color;}",
  "mondrian": "#version 300 es\n\nprecision highp float;in vec2 vTextureCoord;uniform sampler2D uTexture;\nuniform float uTime;uniform vec2 uMousePos;\nuniform vec2 uResolution;float ease (int easingFunc, float t) {\nreturn t;\n}float getExponentialWeight(int index) {\nswitch(index) {\ncase 0: return 1.0000000000;\ncase 1: return 0.7165313106;\ncase 2: return 0.5134171190;\ncase 3: return 0.3678794412;\ncase 4: return 0.2636050919;\ncase 5: return 0.1888756057;\ncase 6: return 0.1353352832;\ncase 7: return 0.0969670595;\ncase 8: return 0.0694877157;\ncase 9: return 0.0497870684;\ncase 10: return 0.0356739933;\ncase 11: return 0.0255615332;\ncase 12: return 0.0183156389;\ncase 13: return 0.0131237287;\ncase 14: return 0.0094035626;\ncase 15: return 0.0067379470;\ndefault: return 0.0;\n}\n}out vec4 fragColor;const int ITERATIONS = 16;\nconst float TAU = 6.28318530718;\nconst float REFERENCE_SHORT_SIDE = 1000.0;mat2 rot(float a) {\nfloat s = sin(a);\nfloat c = cos(a);\nreturn mat2(c, -s, s, c);\n}vec2 perp(vec2 v) {\nreturn vec2(-v.y, v.x);\n}vec2 rotateAround(vec2 point, vec2 center, mat2 rotation, float aspectRatio) {\nvec2 translated = point - center;\ntranslated.x *= aspectRatio;\ntranslated = rotation * translated;\ntranslated.x /= aspectRatio;\nreturn translated + center;\n}vec2 getGridOffset(int index) {\nswitch (index) {\ncase 0: return vec2(-0.22, -0.18);\ncase 1: return vec2(0.18, -0.24);\ncase 2: return vec2(-0.14, 0.20);\ncase 3: return vec2(0.24, 0.12);\ncase 4: return vec2(-0.30, 0.02);\ncase 5: return vec2(0.08, -0.32);\ncase 6: return vec2(0.30, -0.06);\ncase 7: return vec2(-0.06, 0.30);\ncase 8: return vec2(0.12, 0.26);\ncase 9: return vec2(-0.26, -0.08);\ncase 10: return vec2(0.28, 0.22);\ncase 11: return vec2(-0.18, 0.28);\ncase 12: return vec2(0.04, -0.20);\ncase 13: return vec2(-0.32, 0.14);\ncase 14: return vec2(0.22, -0.14);\ndefault: return vec2(0.0);\n}\n}vec2 pixelateUV(vec2 uv, vec2 anchorPos, float pixelSizePx, vec2 gridOffset) {\nfloat shortSide = max(min(uResolution.x, uResolution.y), 0.0001);\nvec2 scale = uResolution / shortSide;\nfloat pixelSize = pixelSizePx / REFERENCE_SHORT_SIDE;\nvec2 scaledAnchorPos = anchorPos * scale;\nvec2 pixelCoord = floor((((uv * scale) - scaledAnchorPos) / pixelSize) + gridOffset) * pixelSize;\nvec2 sampleCoord = pixelCoord + (vec2(0.5) - gridOffset) * pixelSize + scaledAnchorPos;\nreturn sampleCoord / scale;\n}vec2 distortUV(vec2 uv) {\nif (1.0000 > 0.0001) {\nfloat aspectRatio = uResolution.x / uResolution.y;\nvec2 anchorPos = vec2(0.5, 0.5) + mix(vec2(0.0), (uMousePos - 0.5), 0.0000);\nvec2 mixPos = vec2(0.5, 0.5) + mix(vec2(0.0), (uMousePos - 0.5), 0.0000);\nvec2 accumulatedUv = vec2(0.0);\nfloat accumulatedWeight = 0.0;\nfloat maxPixelSize = 1.0 + 1.0000 * 50.0;\nfloat curvePower = mix(0.0, -0.5, 1.0000);\nmat2 distortionRotation = rot(0.0000 * TAU);\nvec2 rotatedUv = rotateAround(uv, anchorPos, rot(0.0000 * TAU * -1.0), aspectRatio);for (int i = 0; i < ITERATIONS; i++) {\nfloat weight = getExponentialWeight(i);\nfloat curve = pow(getExponentialWeight((ITERATIONS - 1) - i), curvePower);\nfloat pixelSizePx = mix(maxPixelSize, 1.0, curve);\nfloat offsetStrength = mix(0.35, 0.0, curve);\nvec2 baseOffset = getGridOffset(i) * offsetStrength;\nvec2 swayDir = normalize(perp(baseOffset) + vec2(0.00001, 0.0));float swayAmount = 1.0;\nif(uTime > 0.0) {\nswayAmount = sin(uTime * 0.035 + float(i) * 1.6180339) * abs(offsetStrength) * 0.18;\n}\nvec2 gridOffset = baseOffset + swayDir * swayAmount;\nvec2 pixelUv = pixelateUV(rotatedUv, anchorPos, pixelSizePx, gridOffset);accumulatedUv += pixelUv * weight;\naccumulatedWeight += weight;\n}vec2 blurredUv = rotateAround(\naccumulatedUv / max(accumulatedWeight, 0.0001),\nanchorPos,\ndistortionRotation,\naspectRatio\n);\nfloat blendRadius = ease(\n0,\nmax(0.0, 1.0 - distance(blurredUv * vec2(aspectRatio, 1.0), mixPos * vec2(aspectRatio, 1.0)) * 4.0 * (1.0 - 1.0000))\n);return mix(uv, blurredUv, 1.0000 * blendRadius);\n}return uv;\n}void main() {\nvec2 baseUv = vTextureCoord;\nvec2 uv = distortUV(baseUv);\nvec4 color = texture(uTexture, uv);\nvec4 bg = texture(uTexture, baseUv);color = mix(bg, color, 0.5900);\nfragColor = color;}",
  "diffuse": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec2 vTextureCoord;uniform sampler2D uTexture;uniform float uTime;uniform vec2 uMousePos;\nuniform vec2 uResolution;float ease (int easingFunc, float t) {\nreturn t;\n}uvec2 pcg2d(uvec2 v) {\nv = v * 1664525u + 1013904223u;\nv.x += v.y * v.y * 1664525u + 1013904223u;\nv.y += v.x * v.x * 1664525u + 1013904223u;\nv ^= v >> 16;\nv.x += v.y * v.y * 1664525u + 1013904223u;\nv.y += v.x * v.x * 1664525u + 1013904223u;\nreturn v;\n}float randFibo(vec2 p) {\nuvec2 v = floatBitsToUint(p);\nv = pcg2d(v);\nuint r = v.x ^ v.y;\nreturn float(r) / float(0xffffffffu);\n}const float MAX_ITERATIONS = 24.;\nconst float PI = 3.14159265359;out vec4 fragColor;void main() {\nvec2 uv = vTextureCoord;\nvec2 pos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0000);\nfloat aspectRatio = uResolution.x/uResolution.y;\nfloat delta = fract(floor(uTime)/20.);\nfloat angle, rotation, amp;\nfloat inner = distance(uv * vec2(aspectRatio, 1), pos * vec2(aspectRatio, 1));\nfloat outer = max(0., 1.-distance(uv * vec2(aspectRatio, 1), pos * vec2(aspectRatio, 1)));\nfloat amount = 0.0500 * 2.;vec2 mPos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0000);\npos = vec2(0.5, 0.5);\nfloat dist = ease(0, max(0.,1.-distance(uv * vec2(aspectRatio, 1), mPos * vec2(aspectRatio, 1)) * 4. * (1. - 1.0000)));amount *= dist;\nfloat threshold = mix(0.0, max(1. - 0.6900, 2./MAX_ITERATIONS), step(0.001, amount));\nvec4 result = vec4(0);\nconst float invMaxIterations = 1.0 / float(MAX_ITERATIONS);vec2 dir = vec2(0.4300 / aspectRatio, 1.-0.4300) * amount * 0.4;float iterations = 0.0;\nfor(float i = 1.; i <= MAX_ITERATIONS; i++) {\nfloat th = i * invMaxIterations;\nif(th > threshold) break;float random1 = randFibo(uv + th + delta);\nfloat random2 = randFibo(uv + th * 2. + delta);\nfloat random3 = randFibo(uv + th * 3. + delta);\nvec2 ranPoint = vec2(random1 * 2. - 1., random2 * 2. - 1.) * mix(1., random3, 0.8);\nresult += texture(uTexture, uv + ranPoint * dir);\niterations += 1.0;\n}vec4 color = result / max(1.0, iterations);if(iterations == 0.0) {\ncolor = texture(uTexture, uv);\n}\nfragColor = color;}",
  "shape": "#version 300 es\n\nprecision highp float;in vec2 vTextureCoord;\nin vec3 vVertexPosition;uniform vec2 uArtboardResolution;uniform vec2 uMousePos;const float TAU = 6.28318530718;\nconst float PI = 3.14159265359;out vec4 fragColor;vec2 rotate2D(vec2 p, float angle) {\nfloat s = sin(angle);\nfloat c = cos(angle);\nreturn vec2(p.x * c - p.y * s, p.x * s + p.y * c);\n}vec2 getAnchorOffsets() {\nreturn vec2(0.5, 0.5);\n}vec3 getFillColor(vec2 localPos, vec2 elementSize, float signedDist, float maxInset) {\nvec2 halfSize = elementSize * 0.5;\nvec2 p = localPos - halfSize;return vec3(0.3686274509803922, 0.3686274509803922, 0.3686274509803922);\n}float sdBox(vec2 p, vec2 b) {\nvec2 d = abs(p) - b;\nreturn length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);\n}float sdEllipse(vec2 p, vec2 ab) {\nvec2 q = p / ab;\nreturn (length(q) - 1.0) * min(ab.x, ab.y);\n}float sdShape(vec2 canvasPosPx, vec2 elementPosPx, vec2 elementSizePx, float rotationTurns) {\nvec2 p = vec2(0.0);\nvec2 halfSize = vec2(0.0);elementSizePx = abs(elementSizePx);vec2 centerPx = elementPosPx + elementSizePx * 0.5;\nvec2 rel = canvasPosPx - centerPx;\nvec2 local = rotate2D(rel, -rotationTurns * TAU) + elementSizePx * 0.5;\np = local - elementSizePx * 0.5;\nhalfSize = elementSizePx * 0.5;return sdEllipse(p, vec2(max(halfSize.x, 0.00001), max(halfSize.y, 0.00001)));\nreturn sdBox(p, halfSize);\n}vec4 sampleShape(vec2 canvasUV) {\nvec2 canvasPosPx = vec2(canvasUV.x * uArtboardResolution.x, (1.0 - canvasUV.y) * uArtboardResolution.y);float absWidth = 250.0000;\nfloat absHeight = 250.0000;\nvec2 elementSizePx = vec2(absWidth, absHeight);\nvec2 elementPosPx = vec2(0.5000, 0.5000) * uArtboardResolution - getAnchorOffsets() * elementSizePx;float dist = sdShape(canvasPosPx, elementPosPx, elementSizePx, 0.0000);\nfloat aa = max(length(vec2(dFdx(dist), dFdy(dist))), 0.75);\nfloat uvGrad = max(length(dFdx(canvasUV)), length(dFdy(canvasUV)));\nfloat seamFactor = smoothstep(0.01, 0.03, uvGrad);\naa = mix(aa, 0.75, seamFactor);float fillAlpha = 1.0 - smoothstep(mix(0.0, -150., 0.1500), mix(aa, 150., 0.1500), dist);\nfillAlpha = mix(fillAlpha, step(dist, 0.0), seamFactor);\nvec2 localPos;\nlocalPos = rotate2D(canvasPosPx - (elementPosPx + elementSizePx * 0.5), 0.0000 * -TAU) + elementSizePx * 0.5;\nvec2 localSize;\nlocalSize = elementSizePx;vec2 centerPx;\ncenterPx = elementPosPx + elementSizePx * 0.5;\nfloat centerDist = sdShape(centerPx, elementPosPx, elementSizePx, 0.0000);\nfloat maxInset = max(-centerDist, 0.00001);vec3 fillRgb = getFillColor(localPos, localSize, dist, maxInset);float finalFillAlpha = fillAlpha * 1.0000;\nvec4 fill = vec4(fillRgb * finalFillAlpha, finalFillAlpha);float strokeAlpha = 0.0;\nvec4 stroke = vec4(vec3(0, 0, 0) * strokeAlpha, strokeAlpha);\nvec4 col = stroke + fill * (1.0 - stroke.a);\nreturn col;\n}vec4 getSourceOutput(vec2 uv) {\nreturn sampleShape(uv);\n}void main() {\nvec2 uv = vTextureCoord;\nvec2 pos = (uMousePos - 0.5) * 1.0000;uv -= pos;fragColor = getSourceOutput(uv);\n}",
  "texturize": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec3 vVertexPosition;\nin vec2 vTextureCoord;uniform sampler2D uTexture;\nuniform float uTime;uvec2 pcg2d(uvec2 v) {\nv = v * 1664525u + 1013904223u;\nv.x += v.y * v.y * 1664525u + 1013904223u;\nv.y += v.x * v.x * 1664525u + 1013904223u;\nv ^= v >> 16;\nv.x += v.y * v.y * 1664525u + 1013904223u;\nv.y += v.x * v.x * 1664525u + 1013904223u;\nreturn v;\n}float randFibo(vec2 p) {\nuvec2 v = floatBitsToUint(p);\nv = pcg2d(v);\nuint r = v.x ^ v.y;\nreturn float(r) / float(0xffffffffu);\n}\nout vec4 fragColor;const float UV_MIN = 0.005;\nconst float UV_MAX = 0.995;float glitchMask(float noise, float amount) {\nreturn max(UV_MIN, sign(noise + amount - 1.0));\n}float centeredOffset(float noise, float amount) {\nreturn (noise * amount - amount / 2.0) / 5.0;\n}vec2 clampUv(vec2 value) {\nreturn clamp(value, vec2(UV_MIN), vec2(UV_MAX));\n}void main() {\nvec2 uv = vTextureCoord;\nfloat steppedTime = floor(uTime * 0.5) * 2.0;\nfloat timeRand1 = randFibo(vec2(steppedTime + 0.001, 0.5));\nfloat timeRand2 = randFibo(vec2(steppedTime + 1.001, 0.5));\nfloat sizeX = 0.0100 * 0.2 * timeRand1;\nfloat sizeY = 0.0100 * 0.2 * timeRand2;\nfloat floorY = floor(uv.y / sizeY) + UV_MIN;\nfloat floorX = floor(uv.x / sizeX) + UV_MIN;\nfloat phase = 0.3500 * 0.01;\nfloat chromab = 0.1400 * 0.75;\nfloat offset = 0.;vec2 blockSize = vec2(50.0, 50.0) * (1.0 - 0.0100);\nvec2 blockUV = floor(uv * blockSize) / blockSize;\nfloat blockRand = randFibo(blockUV);\nfloat blockTimeRand = timeRand1;\nfloat blockNoise = mix(\n1.,\nstep(0.8, randFibo(vec2(blockTimeRand, blockRand))),\n0.0500\n);float offsetX = 0.1300 * 0.5 * blockNoise;\nfloat offsetY = 0.0400 * 0.5 * blockNoise;float randY = randFibo(vec2(sin(floorY + offset + phase), 0.5));\nfloat randX = randFibo(vec2(cos(floorX + offset + phase), 0.5));\nfloat glitchModX = glitchMask(randY, 0.3500);\nfloat glitchModY = glitchMask(randX, 0.3500);float randOffX = randFibo(vec2(floorY + offset * glitchModX + phase, 0.7));\nfloat randOffY = randFibo(vec2(floorX + offset * glitchModY + phase, 0.9));\nfloat offX = centeredOffset(randOffX, offsetX);\nfloat offY = centeredOffset(randOffY, offsetY);offX = clamp(offX, -1.0, 1.0);\noffY = clamp(offY, -1.0, 1.0);uv.x = mix(uv.x, uv.x + offX * 2., glitchModX);\nuv.y = mix(uv.y, uv.y + offY * 2., glitchModY);float waveFreq = 30.0;\nfloat waveAmp = 0.005 * 0.3500;\nfloat timeOffset = uTime * 0.05;\nfloat sinY = sin((uv.y + 0.3500) * waveFreq * (1. - 0.0100) * 2. + timeOffset);\nfloat rogue = smoothstep(0., 2., sinY - 0.5) * 0.2 * 0.3500;\nfloat sinWaveX = sin(uv.y * waveFreq + uTime);\nfloat sinWaveY = sin(uv.x * waveFreq + uTime);\nuv.x += sinWaveX * waveAmp + rogue;\nuv.y += sinWaveY * waveAmp;\nfloat waveX = sinWaveX * waveAmp + rogue * chromab * 0.2;uv = clampUv(uv);vec4 color = texture(uTexture, uv);vec2 glitchOffset = vec2(offX, offY) * glitchModX * chromab;\nvec2 redOffset = clampUv(uv + vec2(-glitchOffset.x - waveX, -glitchOffset.y));\nvec2 blueOffset = clampUv(uv + vec2(glitchOffset.x + waveX, glitchOffset.y));color.r = texture(uTexture, redOffset).r;\ncolor.b = texture(uTexture, blueOffset).b;\nfragColor = color;}",
  "blobMask": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec2 vTextureCoord;\nuniform sampler2D uTexture;\nuniform sampler2D uPreviousFrameTexture;\nuniform vec2 uResolution;out vec4 fragColor;float luma(vec3 color) {\nreturn dot(color, vec3(0.299, 0.587, 0.114));\n}vec4 maskPass(vec2 uv) {\nvec2 texel = 1.0 / uResolution;vec4 current = texture(uTexture, uv);\nfloat currentLuma = luma(current.rgb);\nif (current.a < 0.005 && currentLuma < 0.005) return vec4(0.0);float l = luma(texture(uTexture, uv + vec2(-1.0, 0.0) * texel).rgb);\nfloat r = luma(texture(uTexture, uv + vec2( 1.0, 0.0) * texel).rgb);\nfloat t = luma(texture(uTexture, uv + vec2( 0.0,-1.0) * texel).rgb);\nfloat b = luma(texture(uTexture, uv + vec2( 0.0, 1.0) * texel).rgb);float gx = r - l;\nfloat gy = b - t;\nfloat gradMag = length(vec2(gx, gy));vec4 prevOutput = texture(uPreviousFrameTexture, uv);\nif (all(equal(prevOutput, vec4(0.0)))) {\nreturn vec4(0.0, currentLuma, gx * 0.5 + 0.5, gy * 0.5 + 0.5);\n}\nfloat prevLuma = prevOutput.g;\nvec2 prevGrad = (prevOutput.ba - 0.5) * 2.0;\nfloat prevGradMag = length(prevGrad);float lumaDiff = abs(currentLuma - prevLuma);\nfloat threshold = 0.1600 * 0.2;\nfloat lumaMotion = smoothstep(threshold, threshold + 0.15, lumaDiff);float magChange = abs(gradMag - prevGradMag);\nfloat structuralMotion = smoothstep(0.08, 0.5, magChange);\nfloat detected = max(lumaMotion, lumaMotion * structuralMotion);\ndetected = smoothstep(0.05, 0.4, detected);float prevDetected = prevOutput.r;\nfloat riseRate = 0.6;\nfloat fallRate = mix(0.5, 0.85, 1.0000);\ndetected = (detected > prevDetected)\n? mix(prevDetected, detected, riseRate)\n: prevDetected * fallRate;return vec4(detected, currentLuma, gx * 0.5 + 0.5, gy * 0.5 + 0.5);\n}void main() {\nvec2 uv = vTextureCoord;\nfragColor = maskPass(uv);\n}",
  "blobPeak": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec2 vTextureCoord;\nuniform sampler2D uTexture;\nuniform vec2 uResolution;out vec4 fragColor;vec2 getDirection(int i) {\nfloat angle = float(i) * 0.7853981634;\nreturn vec2(cos(angle), sin(angle));\n}vec4 peakPass(vec2 uv) {\nvec2 texel = 1.0 / uResolution;\nconst float ACTIVE_THRESHOLD = 0.02;\nconst float FILL_RADIUS = 6.0;\nvec4 centerSample = texture(uTexture, uv);\nfloat centerVal = centerSample.r;\nfloat quickMax = centerVal;\nquickMax = max(quickMax, texture(uTexture, uv + vec2(4.0, 0.0) * texel).r);\nquickMax = max(quickMax, texture(uTexture, uv + vec2(-4.0, 0.0) * texel).r);\nquickMax = max(quickMax, texture(uTexture, uv + vec2(0.0, 4.0) * texel).r);\nquickMax = max(quickMax, texture(uTexture, uv + vec2(0.0, -4.0) * texel).r);\nif (quickMax < ACTIVE_THRESHOLD * 0.5) {\nreturn vec4(0.0, 0.5, 0.5, 0.0);\n}\nfloat nearestActiveDist = FILL_RADIUS + 1.0;\nfloat maxVal = centerVal;\nvec2 gradient = vec2(0.0);\nif (centerVal > ACTIVE_THRESHOLD) {\nnearestActiveDist = 0.0;\n}\nfor (int i = 0; i < 8; i++) {\nvec2 dir = getDirection(i);\nfor (float d = 2.0; d <= FILL_RADIUS; d += 2.0) {\nvec2 offset = dir * d * texel;\nfloat v = texture(uTexture, uv + offset).r;\nif (v > ACTIVE_THRESHOLD) {\nnearestActiveDist = min(nearestActiveDist, d);\n}\nmaxVal = max(maxVal, v);\nif (v > 0.01) {\ngradient += dir * d * v;\n}\n}\n}\nfloat result = 0.0;\nif (nearestActiveDist <= FILL_RADIUS) {\nresult = 1.0 - smoothstep(FILL_RADIUS * 0.5, FILL_RADIUS, nearestActiveDist);\nresult *= mix(0.7, 1.0, smoothstep(0.0, 0.1, maxVal));\n}\nfloat gradLen = length(gradient);\nvec2 gradDir = (gradLen > 0.001) ? gradient / gradLen : vec2(0.0);\nvec2 gradEncoded = gradDir * 0.5 + 0.5;\nfloat peakness = (maxVal > ACTIVE_THRESHOLD && result > 0.02) ?\nclamp(maxVal / 0.2, 0.0, 1.0) : 0.0;\nreturn vec4(result, gradEncoded.x, gradEncoded.y, peakness);\n}void main() {\nvec2 uv = vTextureCoord;\nfragColor = peakPass(uv);\n}",
  "blobSlot": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec2 vTextureCoord;\nuniform sampler2D uTexture;\nuniform sampler2D uPreviousFrameTexture;\nuniform vec2 uResolution;out vec4 fragColor;const int MAX_BLOBS = 16;\nconst float GRID_SIZE = 8.0;\nconst float BLOB_SLOT_HEIGHT = 0.02;vec2 getBlobSlotUV(int blobIndex) {\nfloat slotX = (float(blobIndex) + 0.5) / 11.0000;\nreturn vec2(slotX, BLOB_SLOT_HEIGHT * 0.5);\n}bool isBlobSlot(vec2 uv) {\nreturn uv.y < BLOB_SLOT_HEIGHT;\n}int getBlobIndexForUV(vec2 uv) {\nreturn int(floor(uv.x * 11.0000));\n}bool isBlobStateAlive(vec4 state) {\nreturn state.z > 0.01 && state.w > 0.05 && state.x >= 0.0;\n}bool checkBlobCollision(vec2 cPos, int slotIndex, float minSpacing, bool checkLower, bool checkHigher) {\nif (checkLower) {\nfor (int j = 0; j < MAX_BLOBS; j++) {\nif (j >= slotIndex) break;\nif (j >= int(11.0000)) break;\nvec4 jState = textureLod(uPreviousFrameTexture, getBlobSlotUV(j), 0.0);\nif (!isBlobStateAlive(jState)) continue;\nif (length(cPos - jState.xy) < minSpacing) return true;\n}\n}\nif (checkHigher) {\nfor (int j = 0; j < MAX_BLOBS; j++) {\nint idx = slotIndex + 1 + j;\nif (idx >= int(11.0000)) break;\nvec4 jState = textureLod(uPreviousFrameTexture, getBlobSlotUV(idx), 0.0);\nif (!isBlobStateAlive(jState)) continue;\nif (length(cPos - jState.xy) < minSpacing) return true;\n}\n}\nreturn false;\n}vec4 sampleGridCell(vec2 cellCenter, vec2 cellSize, out vec2 sumPos2, out vec2 bestPeakPos) {\nconst int SAMPLE_COUNT = 25;\nfloat sumW = 0.0;\nvec2 sumPos = vec2(0.0);\nsumPos2 = vec2(0.0);\nfloat bestPeakStrength = 0.0;\nbestPeakPos = vec2(0.0);\nfor (int s = 0; s < SAMPLE_COUNT; s++) {\nfloat x = float(s % 5);\nfloat y = float(s / 5);\nvec2 offset = (vec2(x, y) / 4.0 - 0.5) * cellSize;\nvec2 samplePos = cellCenter + offset;\nif (samplePos.x < 0.0 || samplePos.x > 1.0 ||\nsamplePos.y < 0.0 || samplePos.y > 1.0) continue;vec4 peakData = texture(uTexture, samplePos);\nfloat fieldStrength = peakData.r;\nfloat peakness = peakData.a;\nif (fieldStrength > 0.01) {\nfloat w = fieldStrength * (1.0 + peakness * 0.3);\nsumW += w;\nsumPos += samplePos * w;\nsumPos2 += samplePos * samplePos * w;\nfloat peakScore = fieldStrength * (0.5 + peakness);\nif (peakScore > bestPeakStrength) {\nbestPeakStrength = peakScore;\nbestPeakPos = samplePos;\n}\n}\n}\nreturn vec4(sumW, sumPos.x, sumPos.y, bestPeakStrength);\n}vec4 slotPass(vec2 uv) {\nif (!isBlobSlot(uv)) return vec4(0.0);int slotIndex = getBlobIndexForUV(uv);\nif (slotIndex >= int(11.0000)) return vec4(0.0);vec2 slotUV = getBlobSlotUV(slotIndex);\nvec4 prevState = texture(uPreviousFrameTexture, slotUV);\nvec2 prevPos = prevState.xy;\nfloat prevSize = prevState.z;\nfloat prevConf = prevState.w;\nbool wasAlive = (prevSize > 0.01 && prevConf > 0.05 && prevPos.x >= 0.0);vec2 bestPos = vec2(-1.0);\nvec2 bestSize = vec2(0.0);\nfloat bestScore = 0.0;\nfloat cols = ceil(sqrt(11.0000));\nfloat rows = ceil(11.0000 / cols);\nfloat col = mod(float(slotIndex), cols);\nfloat row = floor(float(slotIndex) / cols);\nvec2 slotCenter = vec2((col + 0.5) / cols, (row + 0.5) / rows);\nfloat slotRadius = 0.5 / max(cols, rows);\nconst float MIN_SPACING = 0.07;\nconst float TRACK_RADIUS = 0.05;\nvec2 cellSize = vec2(1.0 / GRID_SIZE);for (int cell = 0; cell < 64; cell++) {\nint cx = cell % 8;\nint cy = cell / 8;\nvec2 cellCenter = (vec2(float(cx), float(cy)) + 0.5) / GRID_SIZE;\nvec2 sumPos2;\nvec2 bestPeakPos;\nvec4 sampleResult = sampleGridCell(cellCenter, cellSize, sumPos2, bestPeakPos);\nfloat sumW = sampleResult.x;\nvec2 sumPos = sampleResult.yz;\nfloat bestPeakStrength = sampleResult.w;if (sumW < 0.015) continue;vec2 cPos = sumPos / sumW;\nif (bestPeakStrength > 0.2) {\ncPos = mix(cPos, bestPeakPos, 0.05);\n}\nvec2 var = max(sumPos2 / sumW - cPos * cPos, vec2(0.0));\nfloat activity = clamp(sumW / 0.25, 0.0, 1.0);\nfloat minActivity = wasAlive ? 0.12 : 0.2;\nif (activity < minActivity) continue;float sizeScalar = sqrt(max(var.x, var.y)) * mix(1.5, 3.5, activity);\nfloat maxSize = mix(0.2, 1.2, 0.3700);\nsizeScalar = sizeScalar * maxSize;float distFromSelf = length(cPos - prevPos);\nif (checkBlobCollision(cPos, slotIndex, MIN_SPACING, true, false)) continue;\nif (wasAlive && distFromSelf > TRACK_RADIUS) continue;\nif (!wasAlive) {\nif (checkBlobCollision(cPos, slotIndex, MIN_SPACING, false, true)) continue;\n}float score = sumW * activity;\nfloat distFromSlot = length(cPos - slotCenter);\nfloat regionBonus = exp(-distFromSlot * distFromSlot / (slotRadius * slotRadius * 2.0));\nif (wasAlive) {\nscore *= exp(-distFromSelf * 2.0);\nscore *= (0.5 + 0.5 * regionBonus);\n} else {\nscore *= (0.8 + 0.2 * regionBonus);\n}\nif (score > bestScore) {\nbestScore = score;\nbestPos = cPos;\nbestSize = vec2(sizeScalar);\n}\n}vec2 newPos, newSize;\nfloat SPAWN_THRESHOLD = mix(0.12, 0.05, 1.0000);\nfloat TRACK_THRESHOLD = mix(0.06, 0.02, 1.0000);\nfloat acceptThreshold = wasAlive ? TRACK_THRESHOLD : SPAWN_THRESHOLD;\nfloat newConf = 0.0;\nfloat bestConf = clamp(bestScore * 8.0, 0.0, 1.0);\nconst float MIN_PEAK_STRENGTH = 0.02;\nfloat peakAtBest = 0.0;\nvec2 texel = 1.0 / uResolution;\nfor (int p = 0; p < 25; p++) {\nfloat px = float(p % 5) - 2.0;\nfloat py = float(p / 5) - 2.0;\nfloat pVal = texture(uTexture, bestPos + vec2(px, py) * texel * 2.0).r;\npeakAtBest = max(peakAtBest, pVal);\n}\nbool canAccept = bestScore > acceptThreshold && peakAtBest > MIN_PEAK_STRENGTH;if (canAccept) {\nif (wasAlive) {\nfloat smoothFactor = mix(1.0, 0.05, 0.1900);\nnewPos = mix(prevPos, bestPos, smoothFactor);\nnewSize = vec2(prevSize);\n} else {\nnewPos = bestPos;\nnewSize = bestSize;\n}\nnewConf = clamp(max(prevConf * 0.8, bestConf), 0.0, 1.0);\n} else {\nnewPos = vec2(-1.0);\nnewSize = vec2(0.0);\nnewConf = 0.0;\n}return vec4(newPos, newSize.x, newConf);\n}void main() {\nvec2 uv = vTextureCoord;\nfragColor = slotPass(uv);\n}",
  "blobDraw": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec2 vTextureCoord;\nuniform sampler2D uTexture;\nuniform sampler2D uBgTexture;\nuniform sampler2D uFontAtlas;uniform vec2 uResolution;\nvec3 blend (int blendMode, vec3 src, vec3 dst) {\nreturn src + dst;\n}out vec4 fragColor;const float FONT_COLS = 8.0;\nconst float FONT_ROWS = 8.0;const int FONT_START_CHAR = 32;\nconst int MAX_BLOBS = 16;\nconst float BLOB_SLOT_HEIGHT = 0.02;float sampleChar(vec2 uv, int charCode) {\nint charIndex = charCode - FONT_START_CHAR;\nif (charIndex < 0 || charIndex >= 64) return 0.0;\nfloat col = mod(float(charIndex), FONT_COLS);\nfloat row = floor(float(charIndex) / FONT_COLS);\nfloat cellSize = 1.0 / 8.0;\nfloat x = (col + uv.x) * cellSize;\nfloat y = 1.0 - (row + 1.0 - uv.y) * cellSize;\nreturn textureLod(uFontAtlas, vec2(x, y), 0.0).r;\n}float renderDigit(vec2 uv, vec2 pos, vec2 size, int digit) {\nvec2 localUV = (uv - pos) / size;\nif (localUV.x < 0.0 || localUV.x > 1.0 || localUV.y < 0.0 || localUV.y > 1.0) {\nreturn 0.0;\n}\nint charCode = 48 + digit;\nfloat sdf = sampleChar(localUV, charCode);\nfloat edge = 0.7;\nfloat smoothing = 0.05;\nreturn smoothstep(edge - smoothing, edge + smoothing, sdf);\n}float renderChar(vec2 uv, vec2 pos, vec2 size, int charCode) {\nvec2 localUV = (uv - pos) / size;\nif (localUV.x < 0.0 || localUV.x > 1.0 || localUV.y < 0.0 || localUV.y > 1.0) {\nreturn 0.0;\n}\nfloat sdf = sampleChar(localUV, charCode);\nfloat edge = 0.6;\nfloat smoothing = 0.05;\nreturn smoothstep(edge - smoothing, edge + smoothing, sdf);\n}float renderCoords(vec2 uv, vec2 pos, vec2 charSize, vec2 coords) {\nfloat result = 0.0;\nfloat spacing = charSize.x * 0.35;\nint x = int(clamp(coords.x * 100.0, 0.0, 99.0));\nint y = int(clamp(coords.y * 100.0, 0.0, 99.0));\nint xTens = x / 10;\nint xOnes = x - xTens * 10;\nint yTens = y / 10;\nint yOnes = y - yTens * 10;\nfloat startX = pos.x - spacing * 2.0;\nresult = max(result, renderDigit(uv, vec2(startX, pos.y), charSize, xTens));\nresult = max(result, renderDigit(uv, vec2(startX + spacing, pos.y), charSize, xOnes));\nresult = max(result, renderChar(uv, vec2(startX + spacing * 2.0, pos.y), charSize, 44));\nresult = max(result, renderDigit(uv, vec2(startX + spacing * 3.0, pos.y), charSize, yTens));\nresult = max(result, renderDigit(uv, vec2(startX + spacing * 4.0, pos.y), charSize, yOnes));\nreturn result;\n}vec2 getBlobSlotUV(int blobIndex) {\nfloat slotX = (float(blobIndex) + 0.5) / 11.0000;\nreturn vec2(slotX, BLOB_SLOT_HEIGHT * 0.5);\n}vec4 getBlobStateFromSlot(int i, sampler2D tex) {\nif (i >= int(11.0000)) return vec4(-1.0, -1.0, 0.0, 0.0);\nreturn textureLod(tex, getBlobSlotUV(i), 0.0);\n}bool isBlobStateActive(vec4 state) {\nreturn state.x >= 0.0 && state.z >= 0.01 && state.w >= 0.1;\n}float circleSDF(vec2 p, vec2 center, float radius) {\nreturn length(p - center) - radius;\n}float dashedLineSDF(vec2 p, vec2 a, vec2 b, float dashLength, float gapLength) {\nvec2 pa = p - a;\nvec2 ba = b - a;\nfloat lineLen = length(ba);\nfloat h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);\nfloat distAlongLine = h * lineLen;\nfloat period = dashLength + gapLength;\nfloat inPeriod = mod(distAlongLine, period);\nif (inPeriod > dashLength) return 1.0;\nreturn length(pa - ba * h);\n}float dottedLineSDF(vec2 p, vec2 a, vec2 b) {\nfloat dotLength = 0.004;\nfloat dotGap = 0.008;\nreturn dashedLineSDF(p, a, b, dotLength, dotGap);\n}float lineStyleDistance(vec2 p, vec2 a, vec2 b, float dashLength, float gapLength) {\nreturn dottedLineSDF(p, a, b);\n}void computeLineDistances(vec2 uvA, float aspectRatio, sampler2D tex, float maxConnectionDist, float dashLength, float gapLength, inout float minLineDist) {\nint blobCountInt = int(11.0000);\nfor (int i = 0; i < MAX_BLOBS; i++) {\nif (i >= blobCountInt) break;\nvec4 stateI = getBlobStateFromSlot(i, tex);\nif (!isBlobStateActive(stateI)) continue;\nvec2 posI = stateI.xy;\nvec2 posA = vec2(posI.x * aspectRatio, posI.y);\nfor (int j = 0; j < MAX_BLOBS; j++) {\nif (j <= i) continue;\nif (j >= blobCountInt) break;\nvec4 stateJ = getBlobStateFromSlot(j, tex);\nif (!isBlobStateActive(stateJ)) continue;\nvec2 posJ = stateJ.xy;\nvec2 posB = vec2(posJ.x * aspectRatio, posJ.y);\nif (length(posA - posB) > maxConnectionDist) continue;\nfloat lineD = lineStyleDistance(uvA, posA, posB, dashLength, gapLength);\nminLineDist = min(minLineDist, lineD);\n}\n}\n}float renderLabelCoords(vec2 uvA, float aspectRatio, sampler2D tex) {\nfloat textResult = 0.0;\nfloat charHeight = mix(0.015, 0.05, 0.2100);\nvec2 charSize = vec2(charHeight, charHeight);\nint blobCountInt = int(11.0000);\nfor (int i = 0; i < MAX_BLOBS; i++) {\nif (i >= blobCountInt) break;\nvec4 state = getBlobStateFromSlot(i, tex);\nif (!isBlobStateActive(state)) continue;\nvec2 blobPos = state.xy;\nfloat blobSize = state.z * 0.5;\nvec2 labelPos = vec2(\nblobPos.x * aspectRatio - blobSize + charSize.x * 0.4,\nblobPos.y - blobSize + charSize.y * 0.4\n);\nlabelPos.x += charSize.x;\ntextResult = max(textResult, renderCoords(uvA, labelPos, charSize, blobPos));\n}\nreturn textResult;\n}vec2 blobStylePointData(vec2 uvA, vec2 centerA) {\nfloat pointRadius = 0.005;\nfloat d = circleSDF(uvA, centerA, pointRadius);\nreturn vec2(abs(d), d);\n}vec4 drawPass(vec2 uv) {\nvec4 background = texture(uBgTexture, uv);\nif (background.a < 0.001) return vec4(0.0);float aspectRatio = uResolution.x / uResolution.y;\nfloat minBlobDist = 1.0;\nfloat minLineDist = 1.0;\nbool foundAny = false;\nint blobCountInt = int(11.0000);\nfor (int i = 0; i < MAX_BLOBS; i++) {\nif (i >= blobCountInt) break;\nvec4 state = getBlobStateFromSlot(i, uTexture);\nif (isBlobStateActive(state)) {\nfoundAny = true;\nbreak;\n}\n}\nif (!foundAny) {\nif (1 == 1) {\nreturn background;\n}\nreturn vec4(0.0);\n}\nvec2 uvA = vec2(uv.x * aspectRatio, uv.y);\nfloat lineWidth = 0.1800 * 0.005;\nfloat dashLength = 0.015;\nfloat gapLength = 0.01;\nfloat minFillDist = 1.0;\nfor (int i = 0; i < MAX_BLOBS; i++) {\nif (i >= blobCountInt) break;\nvec4 state = getBlobStateFromSlot(i, uTexture);\nif (!isBlobStateActive(state)) continue;\nvec2 blobPos = state.xy;\nfloat blobSize = state.z * 0.5;\nvec2 centerA = vec2(blobPos.x * aspectRatio, blobPos.y);\nvec2 halfSize = vec2(blobSize);\nfloat blobD = 1.0;\nvec2 blobData = vec2(1.0);\nblobData = blobStylePointData(uvA, centerA);\nblobD = blobData.x;\nminBlobDist = min(minBlobDist, blobD);\nminFillDist = min(minFillDist, blobData.y);\n}\ncomputeLineDistances(uvA, aspectRatio, uTexture, 0.3500, dashLength, gapLength, minLineDist);float connectionWidth = lineWidth;\nfloat blobLineWidth = lineWidth;\nfloat blobResult = 1.0 - smoothstep(blobLineWidth * 0.5, blobLineWidth * 1.5, minBlobDist);\nfloat fillResult = 0.0;\nfillResult = (minFillDist < 0.0) ? 0.1700 : 0.0;\nfloat lineResult = 0.0;lineResult = 1.0 - smoothstep(connectionWidth * 0.5, connectionWidth * 1.5, minLineDist);float textResult = 0.0;\ntextResult = renderLabelCoords(uvA, aspectRatio, uTexture);\nfloat result = max(max(max(blobResult, lineResult), fillResult), textResult);vec3 finalColor;\nvec3 blended = blend(1, vec3(0.6235294117647059, 0.7176470588235294, 0.8), background.rgb);\nfinalColor = mix(background.rgb, blended, result * 0.3700);float finalAlpha = background.a;\nreturn vec4(finalColor, finalAlpha);\n}void main() {\nvec2 uv = vTextureCoord;\nvec4 color = drawPass(uv);\nfragColor = color;}",
  "outline": "#version 300 es\n\nprecision highp float;\nin vec2 vTextureCoord;uniform sampler2D uTexture;\nuniform vec2 uResolution;\nvec4 applyLayerMix(vec4 color, vec4 bg, float amount) {\ncolor.rgb = mix(bg.rgb, color.rgb, amount);\ncolor.a = max(bg.a, amount);\nreturn color;\n}out vec4 fragColor;float luma(vec3 c) {\nreturn dot(c, vec3(0.299, 0.587, 0.114));\n}float interleavedGradientNoise(vec2 st) {\nreturn fract(52.9829189 * fract(dot(st, vec2(0.06711056, 0.00583715))));\n}void main() {\nvec2 uv = vTextureCoord;float thickness = 0.1400;vec2 pixel = (1.0 / uResolution) * max(thickness * 4.0, 0.001);\nfloat noise = interleavedGradientNoise(gl_FragCoord.xy);pixel *= mix(1.0, noise, 0.1);float tl = luma(texture(uTexture, uv + pixel * vec2(-1, -1)).rgb);\nfloat t = luma(texture(uTexture, uv + pixel * vec2( 0, -1)).rgb);\nfloat tr = luma(texture(uTexture, uv + pixel * vec2( 1, -1)).rgb);\nfloat l = luma(texture(uTexture, uv + pixel * vec2(-1, 0)).rgb);\nfloat r = luma(texture(uTexture, uv + pixel * vec2( 1, 0)).rgb);\nfloat bl = luma(texture(uTexture, uv + pixel * vec2(-1, 1)).rgb);\nfloat b = luma(texture(uTexture, uv + pixel * vec2( 0, 1)).rgb);\nfloat br = luma(texture(uTexture, uv + pixel * vec2( 1, 1)).rgb);float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;\nfloat gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;\nfloat edge = length(vec2(gx, gy));float soft = max(0.3300 * 0.5, 0.001);\nedge = smoothstep(0.1800 - soft, 0.1800 + soft, edge);\nedge *= (0.5800 * 2.0);vec4 scene = texture(uTexture, uv);\nvec3 outline = vec3(0.3686274509803922, 0.3686274509803922, 0.3686274509803922) * edge;\nvec3 blended = outline;vec4 col = applyLayerMix(vec4(blended, 1.0), scene, 1.0000);\nfragColor = col;}",
  "halftone": "#version 300 es\n\nprecision mediump float;\nin vec3 vVertexPosition;\nin vec2 vTextureCoord;\nuniform sampler2D uTexture;\nuniform vec2 uResolution;float luma(vec4 color) {\nreturn dot(color.rgb, vec3(0.299, 0.587, 0.114));\n}vec4 RGBtoCMYK (vec3 rgb) {\nfloat r = rgb.r;\nfloat g = rgb.g;\nfloat b = rgb.b;\nfloat k = min(1.0 - r, min(1.0 - g, 1.0 - b));\nvec3 cmy = vec3(0.0);\nfloat invK = 1.0 - k;\nif (invK != 0.0) {\ncmy.x = (1.0 - r - k) / invK;\ncmy.y = (1.0 - g - k) / invK;\ncmy.z = (1.0 - b - k) / invK;\n}\nreturn clamp(vec4(cmy, k), 0.0, 1.0);\n}vec3 CMYKtoRGB (vec4 cmyk, vec3 paperColor) {\nfloat r = (1.0 - cmyk.x) * (1.0 - cmyk.w);\nfloat g = (1.0 - cmyk.y) * (1.0 - cmyk.w);\nfloat b = (1.0 - cmyk.z) * (1.0 - cmyk.w);\nreturn paperColor * vec3(r, g, b);\n}float aastep(float value, float col) {\nfloat afwidth = 1.0000 * 200.0 * (1.0 / uResolution.x);\nfloat softness = 0.08 * smoothstep(0.0, 0.1, col);\nfloat total_width = afwidth + softness;\nfloat minval = -total_width;\nfloat maxval = total_width;\nreturn smoothstep(minval, maxval, value);\n}vec2 rotate2D(vec2 st, float degrees) {\nfloat c = cos(radians(degrees));\nfloat s = sin(radians(degrees));\nreturn vec2(c * st.x + s * st.y, c * st.y - s * st.x);\n}float getChannelVal(vec4 rgba, int channel) {\nif (channel == 0) return RGBtoCMYK(rgba.rgb).x;\nif (channel == 1) return RGBtoCMYK(rgba.rgb).y;\nif (channel == 2) return RGBtoCMYK(rgba.rgb).z;\nif (channel == 3) return RGBtoCMYK(rgba.rgb).w;\nif (channel == 4) return rgba.r;\nif (channel == 5) return rgba.g;\nif (channel == 6) return rgba.b;\nif (channel == 7) return 1.0 - luma(rgba);\nif (channel == 8) return luma(rgba);\nreturn 0.0;\n}float evaluateCell(vec2 offset, vec2 r_st, vec2 f_st, float rot, float scale, float aspectCorrection, float aspectRatio, int channel) {\nvec2 cell_center_r_st = floor(r_st) + offset + 0.5;\nvec2 cell_center_st = rotate2D(cell_center_r_st * aspectCorrection / scale, -rot);\nvec2 cell_center_uv = cell_center_st / vec2(aspectRatio, 1.0) + vec2(0.5, 0.5);\ncell_center_uv = clamp(cell_center_uv, 0.001, 0.999);\nvec4 tex_color = texture(uTexture, cell_center_uv);\nfloat col = getChannelVal(tex_color, channel);\nvec2 local_st = f_st - offset;\nfloat dist = length(local_st) * 1.64;float adjusted_col = clamp(col + 0.0000, 0.0, 1.0);\nfloat R = sqrt(adjusted_col) * 1.25;return aastep(R - dist, adjusted_col);\n}float halftoneDot(vec2 uv, int channel, float angle) {\nfloat aspectRatio = uResolution.x / uResolution.y;\nfloat aspectCorrection = mix(aspectRatio, 1./aspectRatio, 0.5);vec2 st = uv - vec2(0.5, 0.5);\nst *= vec2(aspectRatio, 1.);\nfloat scale = max(1.0000 * 200.0, 1.0);\nfloat rot = angle - 0.5319 * 360.0;\nvec2 r_st = scale * rotate2D(st, rot);\nr_st /= aspectCorrection;\nvec2 f_st = fract(r_st) - 0.5;\nfloat d0 = evaluateCell(vec2(0.0, 0.0), r_st, f_st, rot, scale, aspectCorrection, aspectRatio, channel);\nfloat d1 = evaluateCell(vec2(1.0, 0.0), r_st, f_st, rot, scale, aspectCorrection, aspectRatio, channel);\nfloat d2 = evaluateCell(vec2(-1.0, 0.0), r_st, f_st, rot, scale, aspectCorrection, aspectRatio, channel);\nfloat d3 = evaluateCell(vec2(0.0, 1.0), r_st, f_st, rot, scale, aspectCorrection, aspectRatio, channel);\nfloat d4 = evaluateCell(vec2(0.0, -1.0), r_st, f_st, rot, scale, aspectCorrection, aspectRatio, channel);return max(d0, max(max(d1, d2), max(d3, d4)));\n}vec4 getCMYK(vec2 uv) {\nfloat c = halftoneDot(uv, 0, 15.);\nfloat m = halftoneDot(uv, 1, 75.);\nfloat y = halftoneDot(uv, 2, 0.);\nfloat k = halftoneDot(uv, 3, 45.);\nvec3 paperColor = vec3(1.0);\nreturn vec4(CMYKtoRGB(vec4(c, m, y, k), paperColor), 1.0);\n}vec4 getHalftone(vec2 uv) {\nreturn getCMYK(uv);\n}out vec4 fragColor;\nvoid main() {\nvec4 clipColor = texture(uTexture, vTextureCoord);\nif(clipColor.a == 0.) {\nfragColor = vec4(0);\nreturn;\n}\nvec2 uv = vTextureCoord;\nvec4 color = texture(uTexture, uv);\nfloat alpha = color.a;\nvec4 halftone = getHalftone(uv);\nhalftone *= alpha;\ncolor = mix(color, halftone, 0.3700);\nfragColor = color;}",
  "bloomThreshold": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec3 vVertexPosition;\nin vec2 vTextureCoord;uniform sampler2D uTexture;out vec4 fragColor;float luma(vec4 color) {\nreturn dot(color.rgb, vec3(0.299, 0.587, 0.114));\n}vec4 thresholdPass(vec4 color) {\ncolor.rgb = pow(color.rgb, vec3(1.0/2.2));\ncolor.rgb = 1.2 * (color.rgb - 0.5) + 0.5;\nvec4 bloom = color * smoothstep(0.5800 - 0.1, 0.5800, luma(color));\nreturn vec4(bloom.rgb, color.a);\n}vec4 getColor(vec4 color) {\nreturn thresholdPass(color);\n}void main() {\nvec2 uv = vTextureCoord;\nvec4 color = texture(uTexture, uv);\nfragColor = getColor(color);\n}",
  "bloomDiagonal": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec3 vVertexPosition;\nin vec2 vTextureCoord;uniform sampler2D uTexture;uniform vec2 uResolution;out vec4 fragColor;float getExponentialWeight(int index) {\nswitch(index) {\ncase 0: return 1.0000000000;\ncase 1: return 0.7165313106;\ncase 2: return 0.5134171190;\ncase 3: return 0.3678794412;\ncase 4: return 0.2636050919;\ncase 5: return 0.1888756057;\ncase 6: return 0.1353352832;\ncase 7: return 0.0969670595;\ncase 8: return 0.0694877157;\ndefault: return 0.0;\n}\n}vec4 blur(vec2 uv, bool vertical, float radius, bool diamond) {\nvec4 color = vec4(0.0);\nfloat total_weight = 0.0;\nfloat aspectRatio = uResolution.x/uResolution.y;vec2 dir;\nif (diamond) {\ndir = vertical ? vec2(1, 1) : vec2(1, -1);\n} else {\ndir = vertical ? vec2(0, 1) : vec2(1, 0);\n}\ndir *= vec2(0.5600, 1. - 0.5600);\ndir.x /= aspectRatio;\nvec4 center = texture(uTexture, uv);\nfloat center_weight = getExponentialWeight(0);\ncolor += center * center_weight;\ntotal_weight += center_weight;radius *= 0.6100;\nfor (int i = 1; i <= 8; i++) {\nfloat weight = getExponentialWeight(i);\nfloat offset = mix(0.015, 0.025, radius) * float(i)/8.;\nvec4 sample1 = texture(uTexture, uv + offset * dir);\nvec4 sample2 = texture(uTexture, uv - offset * dir);\ncolor += (sample1 + sample2) * weight;\ntotal_weight += 2.0 * weight;\n}return color / total_weight;\n}vec4 blurPass(vec2 uv, bool vertical, float radius, float intensity, bool diamond) {\nreturn blur(uv, vertical, radius, diamond);\n}vec4 getColor(vec4 color) {\nreturn blurPass(vTextureCoord, false, 30., 1.25, true);\n}void main() {\nvec2 uv = vTextureCoord;\nvec4 color = texture(uTexture, uv);\nfragColor = getColor(color);\n}",
  "bloomReinforce": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec3 vVertexPosition;\nin vec2 vTextureCoord;uniform sampler2D uTexture;\nuniform sampler2D uBgTexture;uniform vec2 uResolution;out vec4 fragColor;float luma(vec4 color) {\nreturn dot(color.rgb, vec3(0.299, 0.587, 0.114));\n}float getExponentialWeight(int index) {\nswitch(index) {\ncase 0: return 1.0000000000;\ncase 1: return 0.7165313106;\ncase 2: return 0.5134171190;\ncase 3: return 0.3678794412;\ncase 4: return 0.2636050919;\ncase 5: return 0.1888756057;\ncase 6: return 0.1353352832;\ncase 7: return 0.0969670595;\ncase 8: return 0.0694877157;\ndefault: return 0.0;\n}\n}vec4 blur(vec2 uv, bool vertical, float radius, bool diamond) {\nvec4 color = vec4(0.0);\nfloat total_weight = 0.0;\nfloat aspectRatio = uResolution.x/uResolution.y;vec2 dir;\nif (diamond) {\ndir = vertical ? vec2(1, 1) : vec2(1, -1);\n} else {\ndir = vertical ? vec2(0, 1) : vec2(1, 0);\n}\ndir *= vec2(0.5600, 1. - 0.5600);\ndir.x /= aspectRatio;\nvec4 center = texture(uTexture, uv);\nfloat center_weight = getExponentialWeight(0);\ncolor += center * center_weight;\ntotal_weight += center_weight;radius *= 0.6100;\nfor (int i = 1; i <= 8; i++) {\nfloat weight = getExponentialWeight(i);\nfloat offset = mix(0.015, 0.025, radius) * float(i)/8.;\nvec4 sample1 = texture(uTexture, uv + offset * dir);\nvec4 sample2 = texture(uTexture, uv - offset * dir);\ncolor += (sample1 + sample2) * weight;\ntotal_weight += 2.0 * weight;\n}return color / total_weight;\n}vec4 thresholdPass(vec4 color) {\ncolor.rgb = pow(color.rgb, vec3(1.0/2.2));\ncolor.rgb = 1.2 * (color.rgb - 0.5) + 0.5;\nvec4 bloom = color * smoothstep(0.5800 - 0.1, 0.5800, luma(color));\nreturn vec4(bloom.rgb, color.a);\n}vec4 blurCombinePass(vec2 uv, bool vertical, float radius, float intensity, bool diamond) {\nvec4 blurred = blur(uv, vertical, radius, diamond);\nreturn (thresholdPass(texture(uBgTexture, uv)) * 0.25 + blurred * intensity);\n}vec4 getColor(vec4 color) {\nreturn blurCombinePass(vTextureCoord, true, 30., 1.25, true);\n}void main() {\nvec2 uv = vTextureCoord;\nvec4 color = texture(uTexture, uv);\nfragColor = getColor(color);\n}",
  "bloomSmallHorizontal": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec3 vVertexPosition;\nin vec2 vTextureCoord;uniform sampler2D uTexture;uniform vec2 uResolution;out vec4 fragColor;float getExponentialWeight(int index) {\nswitch(index) {\ncase 0: return 1.0000000000;\ncase 1: return 0.7165313106;\ncase 2: return 0.5134171190;\ncase 3: return 0.3678794412;\ncase 4: return 0.2636050919;\ncase 5: return 0.1888756057;\ncase 6: return 0.1353352832;\ncase 7: return 0.0969670595;\ncase 8: return 0.0694877157;\ndefault: return 0.0;\n}\n}vec4 blur(vec2 uv, bool vertical, float radius, bool diamond) {\nvec4 color = vec4(0.0);\nfloat total_weight = 0.0;\nfloat aspectRatio = uResolution.x/uResolution.y;vec2 dir;\nif (diamond) {\ndir = vertical ? vec2(1, 1) : vec2(1, -1);\n} else {\ndir = vertical ? vec2(0, 1) : vec2(1, 0);\n}\ndir *= vec2(0.5600, 1. - 0.5600);\ndir.x /= aspectRatio;\nvec4 center = texture(uTexture, uv);\nfloat center_weight = getExponentialWeight(0);\ncolor += center * center_weight;\ntotal_weight += center_weight;radius *= 0.6100;\nfor (int i = 1; i <= 8; i++) {\nfloat weight = getExponentialWeight(i);\nfloat offset = mix(0.015, 0.025, radius) * float(i)/8.;\nvec4 sample1 = texture(uTexture, uv + offset * dir);\nvec4 sample2 = texture(uTexture, uv - offset * dir);\ncolor += (sample1 + sample2) * weight;\ntotal_weight += 2.0 * weight;\n}return color / total_weight;\n}vec4 blurPass(vec2 uv, bool vertical, float radius, float intensity, bool diamond) {\nreturn blur(uv, vertical, radius, diamond);\n}vec4 getColor(vec4 color) {\nreturn blurPass(vTextureCoord, false, 10., 1., false);\n}void main() {\nvec2 uv = vTextureCoord;\nvec4 color = texture(uTexture, uv);\nfragColor = getColor(color);\n}",
  "bloomSmallVertical": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec3 vVertexPosition;\nin vec2 vTextureCoord;uniform sampler2D uTexture;uniform vec2 uResolution;out vec4 fragColor;float getExponentialWeight(int index) {\nswitch(index) {\ncase 0: return 1.0000000000;\ncase 1: return 0.7165313106;\ncase 2: return 0.5134171190;\ncase 3: return 0.3678794412;\ncase 4: return 0.2636050919;\ncase 5: return 0.1888756057;\ncase 6: return 0.1353352832;\ncase 7: return 0.0969670595;\ncase 8: return 0.0694877157;\ndefault: return 0.0;\n}\n}vec4 blur(vec2 uv, bool vertical, float radius, bool diamond) {\nvec4 color = vec4(0.0);\nfloat total_weight = 0.0;\nfloat aspectRatio = uResolution.x/uResolution.y;vec2 dir;\nif (diamond) {\ndir = vertical ? vec2(1, 1) : vec2(1, -1);\n} else {\ndir = vertical ? vec2(0, 1) : vec2(1, 0);\n}\ndir *= vec2(0.5600, 1. - 0.5600);\ndir.x /= aspectRatio;\nvec4 center = texture(uTexture, uv);\nfloat center_weight = getExponentialWeight(0);\ncolor += center * center_weight;\ntotal_weight += center_weight;radius *= 0.6100;\nfor (int i = 1; i <= 8; i++) {\nfloat weight = getExponentialWeight(i);\nfloat offset = mix(0.015, 0.025, radius) * float(i)/8.;\nvec4 sample1 = texture(uTexture, uv + offset * dir);\nvec4 sample2 = texture(uTexture, uv - offset * dir);\ncolor += (sample1 + sample2) * weight;\ntotal_weight += 2.0 * weight;\n}return color / total_weight;\n}vec4 blurPass(vec2 uv, bool vertical, float radius, float intensity, bool diamond) {\nreturn blur(uv, vertical, radius, diamond);\n}vec4 getColor(vec4 color) {\nreturn blurPass(vTextureCoord, true, 10., 1., false);\n}void main() {\nvec2 uv = vTextureCoord;\nvec4 color = texture(uTexture, uv);\nfragColor = getColor(color);\n}",
  "bloomFinal": "#version 300 es\n\nprecision highp float;\nprecision highp int;in vec3 vVertexPosition;\nin vec2 vTextureCoord;uniform sampler2D uTexture;\nuniform sampler2D uBgTexture;\nuvec2 pcg2d(uvec2 v) {\nv = v * 1664525u + 1013904223u;\nv.x += v.y * v.y * 1664525u + 1013904223u;\nv.y += v.x * v.x * 1664525u + 1013904223u;\nv ^= v >> 16;\nv.x += v.y * v.y * 1664525u + 1013904223u;\nv.y += v.x * v.x * 1664525u + 1013904223u;\nreturn v;\n}float randFibo(vec2 p) {\nuvec2 v = floatBitsToUint(p);\nv = pcg2d(v);\nuint r = v.x ^ v.y;\nreturn float(r) / float(0xffffffffu);\n}\nfloat deband() {\nreturn (randFibo(gl_FragCoord.xy) - 0.5) / 255.0;\n}out vec4 fragColor;float luma(vec4 color) {\nreturn dot(color.rgb, vec3(0.299, 0.587, 0.114));\n}vec4 finalPass(vec4 bloomColor) {\nfloat dither = deband();\nbloomColor.rgb *= vec3(1, 1, 1);\nbloomColor.rgb += dither;\nbloomColor.a = luma(bloomColor);\nvec4 sceneColor = texture(uBgTexture, vTextureCoord);\nvec4 finalColor = mix(sceneColor, sceneColor + bloomColor, 0.7800 * 1.9);\nreturn finalColor;\n}vec4 getColor(vec4 color) {\nreturn finalPass(color);\n}void main() {\nvec2 uv = vTextureCoord;\nvec4 color = texture(uTexture, uv);\nfragColor = getColor(color);\n}",
  "noiseBlur": "#version 300 es\n\nprecision highp float;in vec2 vTextureCoord;uniform sampler2D uTexture;uniform float uTime;uniform vec2 uResolution;vec4 permute(vec4 t) {\nreturn t * (t * 34.0 + 133.0);\n}vec3 grad(float hash) {\nvec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;\nvec3 cuboct = cube;float index0 = step(0.0, 1.0 - floor(hash / 16.0));\nfloat index1 = step(0.0, floor(hash / 16.0) - 1.0);cuboct.x *= 1.0 - index0;\ncuboct.y *= 1.0 - index1;\ncuboct.z *= 1.0 - (1.0 - index0 - index1);float type = mod(floor(hash / 8.0), 2.0);\nvec3 rhomb = (1.0 - type) * cube + type * (cuboct + cross(cube, cuboct));vec3 grad = cuboct * 1.22474487139 + rhomb;grad *= (1.0 - 0.042942436724648037 * type) * 3.5946317686139184;return grad;\n}\nvec4 bccNoiseDerivativesPart(vec3 X) {\nvec3 b = floor(X);\nvec4 i4 = vec4(X - b, 2.5);\nvec3 v1 = b + floor(dot(i4, vec4(.25)));\nvec3 v2 = b + vec3(1, 0, 0) + vec3(-1, 1, 1) * floor(dot(i4, vec4(-.25, .25, .25, .35)));\nvec3 v3 = b + vec3(0, 1, 0) + vec3(1, -1, 1) * floor(dot(i4, vec4(.25, -.25, .25, .35)));\nvec3 v4 = b + vec3(0, 0, 1) + vec3(1, 1, -1) * floor(dot(i4, vec4(.25, .25, -.25, .35)));\nvec4 hashes = permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0));\nhashes = permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0));\nhashes = mod(permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0)), 48.0);\nvec3 d1 = X - v1; vec3 d2 = X - v2; vec3 d3 = X - v3; vec3 d4 = X - v4;\nvec4 a = max(0.75 - vec4(dot(d1, d1), dot(d2, d2), dot(d3, d3), dot(d4, d4)), 0.0);\nvec4 aa = a * a; vec4 aaaa = aa * aa;\nvec3 g1 = grad(hashes.x); vec3 g2 = grad(hashes.y);\nvec3 g3 = grad(hashes.z); vec3 g4 = grad(hashes.w);\nvec4 extrapolations = vec4(dot(d1, g1), dot(d2, g2), dot(d3, g3), dot(d4, g4));\nvec3 derivative = -8.0 * mat4x3(d1, d2, d3, d4) * (aa * a * extrapolations)\n+ mat4x3(g1, g2, g3, g4) * aaaa;\nreturn vec4(derivative, dot(aaaa, extrapolations));\n}\nvec4 bccNoiseDerivatives_XYBeforeZ(vec3 X) {\nmat3 orthonormalMap = mat3(\n0.788675134594813, -0.211324865405187, -0.577350269189626,\n-0.211324865405187, 0.788675134594813, -0.577350269189626,\n0.577350269189626, 0.577350269189626, 0.577350269189626);\nX = orthonormalMap * X;\nvec4 result = bccNoiseDerivativesPart(X) + bccNoiseDerivativesPart(X + 144.5);\nreturn vec4(result.xyz * orthonormalMap, result.w);\n}const int MAX_ITERATIONS = 12;\nconst float MAX_ITERATIONS_F = 12.0;\nconst float HALF_ITERATIONS = 6.0;\nconst float INV_MAX_ITERATIONS = 1.0 / MAX_ITERATIONS_F;out vec4 fragColor;const float PI = 3.14159265359;mat2 rot(float a) {\nreturn mat2(cos(a), -sin(a), sin(a), cos(a));\n}float interleavedGradientNoise(vec2 st) {\nreturn fract(52.9829189 * fract(dot(st, vec2(0.06711056, 0.00583715))));\n}vec4 applyNoiseBlur(vec2 uv) {\nfloat aspectRatio = uResolution.x / uResolution.y;\nvec2 aspect = vec2(aspectRatio, 1.0);\nvec2 dir = vec2(0.4900, 1.0 - 0.4900) * (5.0 * 1.0000);\nfloat angle = 0.9990 * -2.0 * PI;\nfloat timePhase = uTime * 0.025 + 1.0000 * 2.0;\nvec2 noiseUv = rot(angle) * (uv * aspect - vec2(0.5, 0.5) * aspect) * dir;\nvec4 noise = bccNoiseDerivatives_XYBeforeZ(vec3(noiseUv, timePhase));\nvec2 noiseOffset = (noise.xy - 0.5) * (0.4000 + 0.01) * 0.25;\nfloat jitter = interleavedGradientNoise(gl_FragCoord.xy) - 0.5;\nvec4 color = vec4(0.0);\nfor (int i = 0; i < MAX_ITERATIONS; i++) {\nfloat offset = float(i) - HALF_ITERATIONS + jitter;\nvec2 st = uv + noiseOffset * (offset * INV_MAX_ITERATIONS);\ncolor += texture(uTexture, st);\n}\nreturn color / MAX_ITERATIONS_F;\n}void main() {\nvec4 color = applyNoiseBlur(vTextureCoord);\nfragColor = color;}"
};

  const FULLSCREEN_VERTEX = `#version 300 es
precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
out vec2 vTextureCoord;
out vec3 vVertexPosition;
void main() {
  gl_Position = vec4(aVertexPosition.xy, 0.0, 1.0);
  vTextureCoord = aTextureCoord;
  vVertexPosition = aVertexPosition;
}`;

  const CLEAR_BLACK = `#version 300 es
precision highp float;
in vec2 vTextureCoord;
out vec4 fragColor;
void main() {
  fragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;

  const COPY = `#version 300 es
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
out vec4 fragColor;
void main() {
  fragColor = texture(uTexture, vTextureCoord);
}`;

  const ADD_COMPOSITE = `#version 300 es
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform sampler2D uBgTexture;
out vec4 fragColor;
void main() {
  vec4 foreground = texture(uTexture, vTextureCoord);
  vec4 background = texture(uBgTexture, vTextureCoord);
  vec3 source = foreground.rgb / max(foreground.a, 0.0001);
  fragColor = vec4(background.rgb + source * foreground.a * 2.2, max(background.a, foreground.a));
}`;

  const CURSOR_ATTRACT = `#version 300 es
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform vec2 uMousePos;
uniform vec2 uResolution;
uniform float uCursorStrength;
uniform float uCursorRadius;
uniform float uCursorPullStrength;
uniform vec3 uTintColor;
uniform float uTintAmount;
uniform float uWhiteAmount;
uniform float uBackgroundSpeed;
uniform float uTime;
out vec4 fragColor;

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vTextureCoord;
  float backgroundSpeed = max(uBackgroundSpeed, 0.0);
  float driftTime = uTime * backgroundSpeed * 0.018;
  vec2 backgroundDrift = vec2(
    sin(uv.y * 11.0 + driftTime) + 0.45 * sin((uv.x + uv.y) * 17.0 - driftTime * 1.3),
    cos(uv.x * 9.0 - driftTime * 0.9) + 0.35 * sin((uv.x - uv.y) * 13.0 + driftTime * 1.7)
  ) * min(0.035, backgroundSpeed * 0.012);
  uv = clamp(uv + backgroundDrift, vec2(0.001), vec2(0.999));
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 cursor = vec2(uMousePos.x * aspect, uMousePos.y);
  vec2 toCursor = cursor - p;
  float distanceToCursor = length(toCursor);
  float innerRadius = max(0.001, uCursorRadius * 0.05);
  float influence = smoothstep(uCursorRadius, innerRadius, distanceToCursor) * uCursorStrength;
  float centerRelief = smoothstep(0.0, uCursorRadius * 0.29, distanceToCursor);
  float widePull = influence * centerRelief;
  vec2 tangent = vec2(-toCursor.y / aspect, toCursor.x);
  vec2 pull = vec2(toCursor.x / aspect, toCursor.y) * (0.115 * widePull * uCursorPullStrength);
  vec2 drift = tangent * sin(distanceToCursor * 22.0 - uTime * 0.026) * (0.012 * influence * uCursorPullStrength);
  vec2 sampleUv = uv - pull - drift;
  sampleUv = clamp(sampleUv, vec2(0.001), vec2(0.999));

  vec4 color = texture(uTexture, sampleUv);
  float lift = smoothstep(uCursorRadius * 0.81, uCursorRadius * 0.13, distanceToCursor) * 0.035 * influence * uCursorPullStrength;
  color.rgb += vec3(lift);
  vec3 tint = uTintColor;
  if (max(max(tint.r, tint.g), tint.b) > 1.0) {
    tint /= 255.0;
  }
  tint = clamp(tint, vec3(0.0), vec3(1.0));
  float whiteAmount = clamp(uWhiteAmount, 0.0, 1.0);
  vec3 tintWithWhite = mix(tint, vec3(1.0), whiteAmount);
  float brightness = max(uTintAmount, 0.0);
  color.rgb = clamp(color.rgb * tintWithWhite * brightness, vec3(0.0), vec3(1.0));
  fragColor = color;
}`;

  const BASE_SPEEDS = {
    wisps: 0.28,
    mondrian: 0.08,
    diffuse: 0,
    shape: 1,
    texturize: 0.06,
    blobMask: 1,
    blobPeak: 1,
    blobSlot: 1,
    blobDraw: 1,
    outline: 1,
    halftone: 1,
    bloomThreshold: 1,
    bloomDiagonal: 1,
    bloomReinforce: 1,
    bloomSmallHorizontal: 1,
    bloomSmallVertical: 1,
    bloomFinal: 1,
    noiseBlur: 0.48,
  };
  const BACKGROUND_SPEED_PASSES = new Set(["wisps", "mondrian", "texturize", "noiseBlur"]);

  const programs = new Map();
  const quad = createQuad();
  const pointer = {
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    strength: 0,
    targetStrength: 0,
  };

  let width = 1;
  let height = 1;
  let pixelWidth = 1;
  let pixelHeight = 1;
  let dpr = 1;
  let sceneA;
  let sceneB;
  let shapeA;
  let shapeB;
  let bloomA;
  let bloomB;
  let blobMaskA;
  let blobMaskB;
  let blobPeak;
  let blobSlotA;
  let blobSlotB;
  let fontAtlas;
  let startedAt = performance.now();
  let running = true;
  let frameId = 0;

  function createQuad() {
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    const data = new Float32Array([
      -1, -1, 0, 0, 0,
       1, -1, 0, 1, 0,
      -1,  1, 0, 0, 1,
       1,  1, 0, 1, 1,
    ]);

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12);
    gl.bindVertexArray(null);

    return vao;
  }

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "unknown shader compile error";
      gl.deleteShader(shader);
      throw new Error(message);
    }

    return shader;
  }

  function getProgram(fragmentSource) {
    if (programs.has(fragmentSource)) return programs.get(fragmentSource);

    const program = gl.createProgram();
    const vertex = compile(gl.VERTEX_SHADER, FULLSCREEN_VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, "aVertexPosition");
    gl.bindAttribLocation(program, 1, "aTextureCoord");
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || "unknown program link error";
      gl.deleteProgram(program);
      throw new Error(message);
    }

    const wrapped = { program, locations: new Map() };
    programs.set(fragmentSource, wrapped);
    return wrapped;
  }

  function uniformLocation(wrapped, name) {
    if (!wrapped.locations.has(name)) {
      wrapped.locations.set(name, gl.getUniformLocation(wrapped.program, name));
    }

    return wrapped.locations.get(name);
  }

  function createTarget(scale = 1) {
    const target = {
      framebuffer: gl.createFramebuffer(),
      texture: gl.createTexture(),
      scale,
      width: 1,
      height: 1,
    };

    resizeTarget(target);
    return target;
  }

  function resizeTarget(target) {
    target.width = Math.max(1, Math.round(pixelWidth * target.scale));
    target.height = Math.max(1, Math.round(pixelHeight * target.scale));

    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, target.width, target.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function bindTexture(name, texture, unit, wrapped) {
    const location = uniformLocation(wrapped, name);
    if (!location || !texture) return unit;

    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, unit);
    return unit + 1;
  }

  function setVec2(wrapped, name, x, y) {
    const location = uniformLocation(wrapped, name);
    if (location) gl.uniform2f(location, x, y);
  }

  function setVec3(wrapped, name, value) {
    const location = uniformLocation(wrapped, name);
    if (location) gl.uniform3f(location, value[0], value[1], value[2]);
  }

  function setFloat(wrapped, name, value) {
    const location = uniformLocation(wrapped, name);
    if (location) gl.uniform1f(location, value);
  }

  function render(fragmentSource, output, options = {}) {
    const wrapped = getProgram(fragmentSource);
    const viewportWidth = output ? output.width : pixelWidth;
    const viewportHeight = output ? output.height : pixelHeight;

    gl.bindFramebuffer(gl.FRAMEBUFFER, output ? output.framebuffer : null);
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    gl.useProgram(wrapped.program);
    gl.bindVertexArray(quad);
    gl.disable(gl.BLEND);

    let unit = 0;
    unit = bindTexture("uTexture", options.texture, unit, wrapped);
    unit = bindTexture("uBgTexture", options.background, unit, wrapped);
    unit = bindTexture("uPreviousFrameTexture", options.previous, unit, wrapped);
    unit = bindTexture("uFontAtlas", fontAtlas, unit, wrapped);

    setVec2(wrapped, "uResolution", viewportWidth, viewportHeight);
    setVec2(wrapped, "uArtboardResolution", ARTBOARD[0], ARTBOARD[1]);
    setVec2(wrapped, "uMousePos", pointer.x, pointer.y);
    setFloat(wrapped, "uTime", options.time || 0);
    setFloat(wrapped, "uOpacity", 1);
    setFloat(wrapped, "uCursorStrength", options.cursorStrength ?? pointer.strength);
    setFloat(wrapped, "uCursorRadius", CONFIG.cursorRadius);
    setFloat(wrapped, "uCursorPullStrength", CONFIG.cursorPullStrength);
    setVec3(wrapped, "uTintColor", CONFIG.color);
    setFloat(wrapped, "uTintAmount", CONFIG.colorAmount);
    setFloat(wrapped, "uWhiteAmount", CONFIG.whiteAmount);
    setFloat(wrapped, "uBackgroundSpeed", CONFIG.backgroundParticleSpeed);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);

    return output;
  }

  function getPassSpeed(name) {
    const baseSpeed = BASE_SPEEDS[name] ?? 1;
    if (BACKGROUND_SPEED_PASSES.has(name)) {
      return baseSpeed * CONFIG.backgroundParticleSpeed;
    }
    return baseSpeed;
  }

  function runPass(name, input, output, elapsedFrames, extra = {}) {
    return render(SHADERS[name], output, {
      texture: input && input.texture,
      background: extra.background && extra.background.texture,
      previous: extra.previous && extra.previous.texture,
      time: elapsedFrames * getPassSpeed(name),
    });
  }

  function makeFontAtlas() {
    const size = 256;
    const cell = size / 8;
    const atlas = document.createElement("canvas");
    const context = atlas.getContext("2d");
    atlas.width = size;
    atlas.height = size;

    context.fillStyle = "black";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "white";
    context.font = "24px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";

    for (let index = 0; index < 64; index += 1) {
      const code = 32 + index;
      const x = (index % 8) * cell + cell * 0.5;
      const y = Math.floor(index / 8) * cell + cell * 0.54;
      context.fillText(String.fromCharCode(code), x, y);
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    return texture;
  }

  function createTargets() {
    sceneA = createTarget();
    sceneB = createTarget();
    shapeA = createTarget();
    shapeB = createTarget();
    bloomA = createTarget(0.5);
    bloomB = createTarget(0.5);
    blobMaskA = createTarget(0.25);
    blobMaskB = createTarget(0.25);
    blobPeak = createTarget(0.25);
    blobSlotA = createTarget(0.25);
    blobSlotB = createTarget(0.25);
  }

  function resizeTargets() {
    [sceneA, sceneB, shapeA, shapeB, bloomA, bloomB, blobMaskA, blobMaskB, blobPeak, blobSlotA, blobSlotB]
      .forEach(resizeTarget);
  }

  function resize() {
    const rect = boundsElement.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width || window.innerWidth || 1));
    height = Math.max(1, Math.round(rect.height || window.innerHeight || 1));
    dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
    pixelWidth = Math.max(1, Math.round(width * dpr));
    pixelHeight = Math.max(1, Math.round(height * dpr));

    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    if (sceneA) resizeTargets();
  }

  function compositeShape(scene, elapsedFrames) {
    runPass("shape", null, shapeA, elapsedFrames);
    if (DEBUG_VIEW === "shape-raw") {
      render(COPY, null, { texture: shapeA.texture, time: elapsedFrames });
      return null;
    }
    runPass("texturize", shapeA, shapeB, elapsedFrames);
    runPass("noiseBlur", shapeB, shapeA, elapsedFrames);
    if (DEBUG_VIEW === "shape") {
      render(COPY, null, { texture: shapeA.texture, time: elapsedFrames });
      return null;
    }
    render(ADD_COMPOSITE, sceneB, {
      texture: shapeA.texture,
      background: scene.texture,
      time: elapsedFrames,
    });
    if (DEBUG_VIEW === "composite") {
      render(CURSOR_ATTRACT, null, {
        texture: sceneB.texture,
        time: elapsedFrames,
        cursorStrength: Math.max(pointer.strength, 0.35),
      });
      return null;
    }
    return sceneB;
  }

  function runBlobTracker(scene, elapsedFrames) {
    runPass("blobMask", scene, blobMaskB, elapsedFrames, { previous: blobMaskA });
    runPass("blobPeak", blobMaskB, blobPeak, elapsedFrames);
    runPass("blobSlot", blobPeak, blobSlotB, elapsedFrames, { previous: blobSlotA });
    runPass("blobDraw", blobSlotB, sceneB, elapsedFrames, { background: scene });

    [blobMaskA, blobMaskB] = [blobMaskB, blobMaskA];
    [blobSlotA, blobSlotB] = [blobSlotB, blobSlotA];

    return sceneB;
  }

  function runBloom(scene, elapsedFrames) {
    const fullA = sceneA;
    const fullB = sceneB;

    runPass("bloomThreshold", scene, fullA, elapsedFrames);
    runPass("bloomDiagonal", fullA, bloomA, elapsedFrames);
    runPass("bloomReinforce", bloomA, bloomB, elapsedFrames, { background: scene });
    runPass("bloomSmallHorizontal", bloomB, fullA, elapsedFrames);
    runPass("bloomSmallVertical", fullA, fullB, elapsedFrames, { background: scene });
    runPass("bloomFinal", fullB, sceneA, elapsedFrames, { background: scene });

    return sceneA;
  }

  function renderFrame(now) {
    if (!running) return;

    const elapsedFrames = ((now - startedAt) / 1000) * 60;
    pointer.x += (pointer.targetX - pointer.x) * 0.1;
    pointer.y += (pointer.targetY - pointer.y) * 0.1;
    pointer.strength += (pointer.targetStrength - pointer.strength) * 0.08;

    render(CLEAR_BLACK, sceneA, { time: elapsedFrames });
    runPass("wisps", sceneA, sceneB, elapsedFrames);
    runPass("mondrian", sceneB, sceneA, elapsedFrames);
    runPass("diffuse", sceneA, sceneB, elapsedFrames);

    let scene = compositeShape(sceneB, elapsedFrames);
    if (!scene) {
      frameId = requestAnimationFrame(renderFrame);
      return;
    }

    render(CURSOR_ATTRACT, null, {
      texture: scene.texture,
      time: elapsedFrames,
      cursorStrength: pointer.strength,
    });
    frameId = requestAnimationFrame(renderFrame);
  }

  function movePointer(event) {
    const rect = boundsElement.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    pointer.targetX = Math.min(1, Math.max(0, localX / Math.max(rect.width, 1)));
    pointer.targetY = 1 - Math.min(1, Math.max(0, localY / Math.max(rect.height, 1)));
    pointer.targetStrength = 1;
  }

  const releasePointer = () => {
    pointer.targetStrength = 0;
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frameId);
      return;
    }

    if (!running) {
      running = true;
      startedAt = performance.now();
      frameId = requestAnimationFrame(renderFrame);
    }
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", movePointer, { passive: true });
  window.addEventListener("pointerdown", movePointer, { passive: true });
  window.addEventListener("pointerleave", releasePointer);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  fontAtlas = makeFontAtlas();
  resize();
  createTargets();
  frameId = requestAnimationFrame(renderFrame);

  return () => {
    running = false;
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", movePointer);
    window.removeEventListener("pointerdown", movePointer);
    window.removeEventListener("pointerleave", releasePointer);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
  };
})();
