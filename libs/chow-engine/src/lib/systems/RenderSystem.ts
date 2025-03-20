import { defineQuery, defineSystem } from 'bitecs';
import { TransformComponent } from '../components/Transform.js';

export default function createRenderSystem() {
  const renderQuery = defineQuery([TransformComponent]);

  return defineSystem((world) => {
    for (const entity of renderQuery(world)) {
      console.log(
        TransformComponent.position.x[entity],
        TransformComponent.position.y[entity],
        TransformComponent.position.z[entity]
      );
    }
    return world;
  });
}
