import { defineComponent, Types } from 'bitecs';

export const Mesh = {
  vertexArray: Types.f32,
};

export const ModelComponent = defineComponent({
  mesh: Mesh,
});
