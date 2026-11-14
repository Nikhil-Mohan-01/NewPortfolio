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
  varying vec2 vUv;

  vec3 picture(vec2 uv) {
    return texture2D(tDiffuse, clamp(uv, 0.0, 1.0)).rgb;
  }

  void main() {
    vec3 color = picture(vUv);
    if (softness > 0.0) {
      vec2 d = cssPixel * softness * 0.7071;
      vec3 neighbors = picture(vUv + d) + picture(vUv - d)
        + picture(vUv + vec2(d.x, -d.y)) + picture(vUv + vec2(-d.x, d.y));
      color = color * 0.56 + neighbors * 0.11;
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
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;
