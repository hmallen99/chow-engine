import {
  addComponent,
  addEntity,
  defineQuery,
  defineSystem,
  IWorld,
  ModelComponent,
  Scene,
  TransformComponent,
} from '@chow/chow-engine';
import { mat4, vec3 } from 'wgpu-matrix';

const xCount = 4;
const yCount = 4;

export const createCubeAnimationSystem = (scene: Scene) => {
  const renderQuery = defineQuery([TransformComponent, ModelComponent]);

  // TODO: Move to camera component
  const aspect = scene.engine.canvas.width / scene.engine.canvas.height;
  const projectionMatrix = mat4.perspective(
    (2 * Math.PI) / 5,
    aspect,
    1,
    100.0
  );
  const viewMatrix = mat4.translation(vec3.fromValues(0, 0, -12));
  const tmpMat4 = mat4.create();

  return defineSystem((world) => {
    const now = Date.now() / 1000;
    let i = 0;
    for (const eid of renderQuery(world)) {
      const x = Math.floor(i / 4);
      const y = i % 4;

      mat4.rotate(
        TransformComponent.matrix[eid],
        vec3.fromValues(
          Math.sin((x + 0.5) * now),
          Math.cos((y + 0.5) * now),
          0
        ),
        1,
        tmpMat4
      );

      mat4.multiply(viewMatrix, tmpMat4, tmpMat4);
      mat4.multiply(projectionMatrix, tmpMat4, tmpMat4);

      console.log(TransformComponent.matrix[eid], tmpMat4);
      TransformComponent.matrix[eid].set(tmpMat4, 0);
      i++;
    }

    return world;
  });
};

export const initializeCubes = (world: IWorld) => {
  const step = 4.0;
  let m = 0;
  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      const eid = addEntity(world);
      addComponent(world, ModelComponent, eid);
      addComponent(world, TransformComponent, eid);
      ModelComponent.mesh[eid] = 0;
      TransformComponent.matrix[eid].set(
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
