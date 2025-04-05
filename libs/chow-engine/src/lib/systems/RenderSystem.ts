import { defineQuery, defineSystem } from 'bitecs';
import { TransformComponent } from '../components/TransformComponent.js';
import { ModelComponent } from '../components/ModelComponent.js';

export default function createRenderSystem() {
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
