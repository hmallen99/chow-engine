export const StandardMaterialModule = `struct Uniforms {
  modelViewProjectionMatrix : mat4x4f,
}

struct ColorInfo {
    ambientColor: vec3f,
    ambientStrength: f32,
}

struct LightInfo {
    lightColor: vec3f,
    lightPosition: vec3f,
}

@binding(0) @group(0) var<uniform> uniforms : Uniforms;
@binding(1) @group(0) var<uniform> colorInfo : ColorInfo;
@binding(2) @group(0) var<uniform> lightInfo: LightInfo;

struct VertexOutput {
  @builtin(position) Position : vec4f,
  @location(0) fragUV : vec2f,
  @location(1) fragPosition: vec4f,
}

@vertex
fn vertexMain(
  @location(0) position : vec4f,
  @location(1) uv : vec2f,
  @location(2) normal : vec3f
) -> VertexOutput {
  var output : VertexOutput;
  output.Position = uniforms.modelViewProjectionMatrix * position;
  output.fragUV = uv;
  output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
  return output;
}

@fragment
fn fragmentMain(
  @location(0) fragUV: vec2f,
  @location(1) fragPosition: vec4f
) -> @location(0) vec4f {
  var ambient : vec3f;
  ambient = colorInfo.ambientStrength * lightInfo.lightColor;
  ambient = ambient * colorInfo.ambientColor;

  return vec4(ambient, 1.0);
}
`;
