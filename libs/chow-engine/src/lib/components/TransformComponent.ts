import { defineComponent } from 'bitecs';
import { Quaternion, Vector3 } from '../data-types/index.js';

export const TransformComponent = defineComponent({
  position: Vector3,
  rotation: Quaternion,
  translation: Vector3,
});
