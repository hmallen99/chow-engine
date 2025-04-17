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
  TransformComponent,
  Types,
} from '@chow/chow-engine';
import { mat4, vec3 } from 'wgpu-matrix';
import { cubeVertexArray, cubeVertexCount } from './cube';
import {
  createNormalMaterialPipeline,
  createNormalMaterialInstance,
} from './normalMat';

const xCount = 4;
const yCount = 4;

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
  let m = 0;

  const device = scene.engine.session.device;

  const vertexBuffer = device.createBuffer({
    size: cubeVertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(vertexBuffer.getMappedRange()).set(cubeVertexArray);
  vertexBuffer.unmap();

  const meshId = scene.meshStore.addMesh({
    vertexBuffers: [
      {
        slot: 0,
        buffer: vertexBuffer,
        offset: 0,
      },
    ],
    drawCount: cubeVertexCount,
  });
  const normalMat = createNormalMaterialPipeline(device, scene.engine.format);
  const normalMatInstance = createNormalMaterialInstance(device, normalMat, 16);

  const materialId = scene.materialStore.addMaterial(normalMatInstance);

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
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

      m++;
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
