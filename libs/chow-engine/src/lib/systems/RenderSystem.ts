import { defineQuery, defineSystem } from 'bitecs';
import { TransformComponent } from '../components/TransformComponent.js';
import { ModelComponent } from '../components/ModelComponent.js';
import { Scene } from '../engine/scene.js';

export default function createRenderSystem(_scene: Scene) {
  const renderQuery = defineQuery([TransformComponent, ModelComponent]);

  return defineSystem((world) => {
    for (const entity of renderQuery(world)) {
      console.log(
        TransformComponent.position.x[entity],
        TransformComponent.position.y[entity],
        TransformComponent.position.z[entity],
        ModelComponent.materials[entity],
        ModelComponent.materials[entity]
      );
    }
    return world;
  });
}
