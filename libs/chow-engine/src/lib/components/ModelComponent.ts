import { defineComponent, Types } from 'bitecs';

export const ModelComponent = defineComponent({
  mesh: Types.ui32,
  materials: [Types.ui32, 8],
});
