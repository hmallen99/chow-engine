export const StandardMaterialModule = /* wgsl */ `
struct Model {
  modelMatrix : mat4x4f,
}

struct Camera {
  viewMatrix : mat4x4f,
  projectionMatrix: mat4x4f,
  position: vec3f,
}

struct ColorInfo {
    objectColor: vec3f,
    ambientStrength: f32,
    specularStrength: f32,
}

struct LightInfo {
    lightColor: vec3f,
    lightPosition: vec3f,
}

@binding(0) @group(0) var<uniform> model : Model;
@binding(1) @group(0) var<uniform> colorInfo : ColorInfo;
@binding(2) @group(0) var<uniform> lightInfo: LightInfo;
@binding(3) @group(0) var<uniform> camera: Camera;

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
  let modelViewMatrix = camera.viewMatrix * model.modelMatrix;
  output.Position = camera.projectionMatrix * modelViewMatrix * position;
  output.fragPosition = vec3f((modelViewMatrix * position).xyz);
  output.fragNormal = vec3f((modelViewMatrix * vec4f(normal, 0)).xyz);
  return output;
}

@fragment
fn fragmentMain(
  @location(0) fragPosition: vec3f,
  @location(1) fragNormal: vec3f,
) -> @location(0) vec4f {
  // Calculate ambient
  let ambient = colorInfo.ambientStrength * lightInfo.lightColor;

  // Calculate diffuse
  let normal = normalize(fragNormal);
  let lightDir = normalize(lightInfo.lightPosition - fragPosition);
  let diff = max(dot(normal, lightDir), 0.0);
  let diffuse = diff * lightInfo.lightColor;

  // Calculate specular
  let viewDir = normalize(camera.position - fragPosition);
  let reflectDir = reflect(-lightDir, normal);
  let spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
  let specular = colorInfo.specularStrength * spec * lightInfo.lightColor;

  let result = (ambient + diffuse + specular) * colorInfo.objectColor;



  return vec4(result, 1.0);
}
`;
