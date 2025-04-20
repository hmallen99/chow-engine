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
  StandardMaterialBuilder,
  StandardMaterialInstance,
  TransformComponent,
  Types,
} from '@chow/chow-engine';
import { mat4, vec3 } from 'wgpu-matrix';
import {
  cubeNormalArray,
  cubePositionArray,
  cubeUVArray,
  cubeVertexCount,
} from './cube';

const xCount = 6;
const yCount = 6;

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

      const instance = scene.materialStore.get(
        ModelComponent.materials[eid][0]
      ) as StandardMaterialInstance;

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

      TransformComponent.matrix[eid].set(tmpMat4, 0);

      instance.updateMatrix(cameraEntity);
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

  const vertexNormalBuffer = device.createBuffer({
    size: cubeNormalArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(vertexNormalBuffer.getMappedRange()).set(cubeNormalArray);
  vertexNormalBuffer.unmap();

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
      {
        slot: 2,
        buffer: vertexNormalBuffer,
        offset: 0,
      },
    ],
    drawCount: cubeVertexCount,
  });
  const materialBuilder = new StandardMaterialBuilder(scene);

  materialBuilder.setLight(vec3.create(0.5, 0.5, 0.5), vec3.create(20, -20, 0));

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      const eid = addEntity(world);
      const materialInstance = materialBuilder.createInstance(eid);
      const materialId = scene.materialStore.addMaterial(materialInstance);
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
      materialInstance.updateAmbientColor(vec3.create(1, 0, 0), 0.5);
      materialInstance.updateSpecularPower(5);
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
  const viewMatrix = mat4.lookAt([0, 0, -12], [0, 0, 0], [0, 1, 0]);
  CameraComponent.aspect[cameraEntity] = aspect;
  CameraComponent.projectionMatrix[cameraEntity] = projectionMatrix;
  CameraComponent.viewMatrix[cameraEntity] = viewMatrix;
  CameraComponent.position[cameraEntity].set([0, 0, -12]);
};
