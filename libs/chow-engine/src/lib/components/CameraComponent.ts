import { defineComponent, Types } from 'bitecs';

export const CameraComponent = defineComponent({
  aspect: Types.f32,
  projectionMatrix: [Types.f32, 16],
  viewMatrix: [Types.f32, 16],
});
