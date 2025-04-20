export const StandardMaterialModule = /* wgsl */ `struct Uniforms {
  modelViewMatrix : mat4x4f,
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
  @location(0) fragPosition : vec3f,
  @location(1) fragNormal : vec3f
}

@vertex
fn vertexMain(
  @location(0) position : vec4f,
  @location(1) uv : vec2f,
  @location(2) normal : vec3f
) -> VertexOutput {
  var output : VertexOutput;
  output.Position = uniforms.modelViewProjectionMatrix * position;
  output.fragPosition = vec3f((uniforms.modelViewMatrix * position).xyz);
  output.fragNormal = vec3f((uniforms.modelViewMatrix * vec4f(normal, 0)).xyz);
  return output;
}

@fragment
fn fragmentMain(
  @location(0) fragPosition: vec3f,
  @location(1) fragNormal: vec3f,
) -> @location(0) vec4f {
  let ambient = colorInfo.ambientStrength * lightInfo.lightColor;
  let normal = normalize(fragNormal);
  let lightDir = normalize(lightInfo.lightPosition - fragPosition);
  let diff = max(dot(normal, lightDir), 0.0);
  let diffuse = diff * lightInfo.lightColor;
  let result = (ambient + diffuse) * colorInfo.ambientColor;

  return vec4(result, 1.0);
}
`;
