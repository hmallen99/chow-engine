import { defineComponent, Types } from 'bitecs';
// import { Quaternion, Vector3 } from '../data-types/index.js';

export const TransformComponent = defineComponent({
  // position: Vector3,
  // rotation: Quaternion,
  // translation: Vector3,
  matrix: [Types.f32, 16],
});
