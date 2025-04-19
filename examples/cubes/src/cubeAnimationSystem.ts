import {
  addComponent,
  addEntity,
  CameraComponent,
  defineComponent,
  defineQuery,
  defineSystem,
  IWorld,
  ModelComponent,
  Scene,
  ShaderMaterialInstance,
  ShaderMaterialPipeline,
  TransformComponent,
  Types,
} from '@chow/chow-engine';
import { mat4, vec3 } from 'wgpu-matrix';
import { cubePositionArray, cubeUVArray, cubeVertexCount } from './cube';
import { fragment, vertex } from './shader';

const xCount = 8;
const yCount = 4;
const offset = 256; // uniformBindGroup offset must be 256-byte aligned

export const createCubeAnimationSystem = (scene: Scene) => {
  const renderQuery = defineQuery([TransformComponent, ModelComponent]);
  const cameraQuery = defineQuery([CameraComponent]);

  const tmpMat4 = mat4.create();

  return defineSystem((world) => {
    const now = Date.now() / 1000;

    const cameraEntity = cameraQuery(world).at(0);

    if (cameraEntity === undefined) return world;

    let i = 0;
    for (const eid of renderQuery(world)) {
      const x = Math.floor(i / 4);
      const y = i % 4;

      mat4.rotate(
        InitialTransformComponent.matrix[eid],
        vec3.fromValues(
          Math.sin((x + 0.5) * now),
          Math.cos((y + 0.5) * now),
          0
        ),
        1,
        tmpMat4
      );

      mat4.multiply(CameraComponent.viewMatrix[cameraEntity], tmpMat4, tmpMat4);
      mat4.multiply(
        CameraComponent.projectionMatrix[cameraEntity],
        tmpMat4,
        tmpMat4
      );

      TransformComponent.matrix[eid].set(tmpMat4, 0);
      i++;
    }

    return world;
  });
};

const InitialTransformComponent = defineComponent({
  matrix: [Types.f32, 16],
});

export const initializeCubes = (world: IWorld, scene: Scene) => {
  const step = 4.0;

  const device = scene.engine.session.device;

  const vertexPositionBuffer = device.createBuffer({
    size: cubePositionArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(vertexPositionBuffer.getMappedRange()).set(
    cubePositionArray
  );
  vertexPositionBuffer.unmap();

  const vertexUVBuffer = device.createBuffer({
    size: cubeUVArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(vertexUVBuffer.getMappedRange()).set(cubeUVArray);
  vertexUVBuffer.unmap();

  const meshId = scene.meshStore.addMesh({
    vertexBuffers: [
      {
        slot: 0,
        buffer: vertexPositionBuffer,
        offset: 0,
      },
      {
        slot: 1,
        buffer: vertexUVBuffer,
        offset: 0,
      },
    ],
    drawCount: cubeVertexCount,
  });
  const normalMatPipeline = new ShaderMaterialPipeline(
    scene,
    { vertex: vertex, fragment: fragment },
    [
      { arrayStride: 4 * 4, format: 'float32x4' },
      { arrayStride: 2 * 4, format: 'float32x2' },
    ]
  );

  const matrixSize = 4 * 16; // 4x4 matrix

  const uniformBufferSize = offset * (xCount * yCount - 1) + matrixSize;

  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      const i = x * yCount + y;
      const instanceOffset = i * offset;
      const normalMatInstance = new ShaderMaterialInstance(
        scene,
        normalMatPipeline,
        [
          {
            binding: 0,
            resource: {
              buffer: uniformBuffer,
              offset: instanceOffset,
              size: matrixSize,
            },
          },
        ],
        (entity: number, instance: ShaderMaterialInstance) => {
          instance.setUniformBuffer(
            TransformComponent.matrix[entity],
            0,
            i * offset
          );
        }
      );
      const materialId = scene.materialStore.addMaterial(normalMatInstance);

      const eid = addEntity(world);
      addComponent(world, ModelComponent, eid);
      addComponent(world, TransformComponent, eid);
      addComponent(world, InitialTransformComponent, eid);
      ModelComponent.mesh[eid] = meshId;
      ModelComponent.materials[eid][0] = materialId;
      InitialTransformComponent.matrix[eid].set(
        mat4.translation(
          vec3.fromValues(
            step * (x - xCount / 2 + 0.5),
            step * (y - yCount / 2 + 0.5),
            0
          )
        ),
        0
      );
    }
  }
};

export const initializeCamera = (world: IWorld, scene: Scene) => {
  const cameraEntity = addEntity(world);
  addComponent(world, CameraComponent, cameraEntity);

  const aspect = scene.engine.canvas.width / scene.engine.canvas.height;
  const projectionMatrix = mat4.perspective(
    (2 * Math.PI) / 5,
    aspect,
    1,
    100.0
  );
  const viewMatrix = mat4.translation(vec3.fromValues(0, 0, -12));
  CameraComponent.aspect[cameraEntity] = aspect;
  CameraComponent.projectionMatrix[cameraEntity] = projectionMatrix;
  CameraComponent.viewMatrix[cameraEntity] = viewMatrix;
};
