// Runs after OutputPass. The input and output are display-encoded values.
// Keep tone mapping, color conversion and bloom in their existing passes.
export const retroVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const retroFragment = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform vec2 cssPixel;
  uniform float softness;
  uniform float saturation;
  uniform float contrast;
  uniform float grain;
  uniform float grainFrame;
  uniform float vignette;
  uniform float chromaticOffset;
  uniform float scanlines;
  uniform float aspect;
  varying vec2 vUv;

  vec3 picture(vec2 uv) {
    return texture2D(tDiffuse, clamp(uv, 0.0, 1.0)).rgb;
  }

  float noise(vec2 cell, float phase) {
    vec3 p = fract(vec3(cell.xyx) * 0.1031 + phase * vec3(0.1543, 0.1277, 0.1379));
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z) * 2.0 - 1.0;
  }

  void main() {
    vec3 center = picture(vUv);
    vec3 color = center;
    if (softness > 0.0) {
      vec2 d = cssPixel * softness * 0.7071;
      vec3 neighbors = picture(vUv + d) + picture(vUv - d)
        + picture(vUv + vec2(d.x, -d.y)) + picture(vUv + vec2(-d.x, d.y));
      color = color * 0.56 + neighbors * 0.11;
    }

    vec2 edge = vUv * 2.0 - 1.0;
    vec2 weights = clamp(vec2(sqrt(aspect), inversesqrt(aspect)), 0.8, 1.2);
    float edgeWeight = smoothstep(0.36, 0.99, length(edge * weights) * 0.7071);
    if (chromaticOffset > 0.0) {
      vec2 shift = normalize(edge + vec2(0.000001)) * cssPixel * chromaticOffset * edgeWeight;
      // Blend tiny opposite shifts into the softened edge, with green anchored.
      color.r += (picture(vUv + shift).r - center.r) * 0.75;
      color.b += (picture(vUv - shift).b - center.b) * 0.75;
    }

    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, saturation);
    float curve = contrast * luma * (1.0 - luma) * (0.58 - luma);
    // Keep the toe anchored at black and warm the highlight shoulders gently.
    float shadow = luma * (1.0 - luma) * (1.0 - smoothstep(0.10, 0.53, luma));
    float highlight = smoothstep(0.45, 0.95, luma) * (1.0 - luma);
    color += curve
      + contrast * shadow * vec3(-0.09, 0.08, 0.20)
      + contrast * highlight * vec3(0.19, 0.07, -0.12);
    color *= 1.0 - vignette * edgeWeight;

    vec2 cssPosition = vUv / cssPixel;
    if (grain > 0.0) {
      float envelope = smoothstep(0.022, 0.32, luma) * (1.0 - smoothstep(0.60, 0.98, luma));
      color += grain * envelope * noise(floor(cssPosition * 1.15), grainFrame);
    }
    if (scanlines > 0.0) {
      // Stationary 3 CSS-pixel spacing, attenuated as display sampling approaches Nyquist.
      float phase = cssPosition.y * 2.094395;
      float band = cos(phase) * (1.0 - smoothstep(1.2, 3.141593, fwidth(phase)));
      color *= 1.0 - scanlines * (0.5 + 0.5 * band);
    }
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;
