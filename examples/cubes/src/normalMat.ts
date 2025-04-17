import {
  MaterialPipeline,
  MaterialInstance,
  TransformComponent,
} from '@chow/chow-engine';
import { cubeVertexSize, cubeUVOffset, cubePositionOffset } from './cube.js';
import {
  vertex as instancedVertWGSL,
  fragment as vertexPositionColorWGSL,
} from './shader.js';

export const createNormalMaterialPipeline = (
  device: GPUDevice,
  presentationFormat: GPUTextureFormat
): MaterialPipeline => {
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: instancedVertWGSL,
      }),
      buffers: [
        {
          arrayStride: cubeVertexSize,
          attributes: [
            {
              // position
              shaderLocation: 0,
              offset: cubePositionOffset,
              format: 'float32x4',
            },
            {
              // uv
              shaderLocation: 1,
              offset: cubeUVOffset,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: vertexPositionColorWGSL,
      }),
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',

      // Backface culling since the cube is solid piece of geometry.
      // Faces pointing away from the camera will be occluded by faces
      // pointing toward the camera.
      cullMode: 'back',
    },

    // Enable depth testing so that the fragment closest to the camera
    // is rendered in front.
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  return {
    pipeline,
    bindGroupLayouts: [pipeline.getBindGroupLayout(0)],
    instanceSlot: -1,
  };
};

export const createNormalMaterialInstance = (
  device: GPUDevice,
  materialPipeline: MaterialPipeline,
  numInstances: number
): MaterialInstance => {
  const matrixFloatCount = 16; // 4x4 matrix
  const matrixSize = 4 * matrixFloatCount;
  const uniformBufferSize = numInstances * matrixSize;

  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformBindGroup = device.createBindGroup({
    layout: materialPipeline.pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
    ],
  });

  let offset = 0;

  // TODO: resize as needed
  const updateNormalMaterialInstance = (entity: number) => {
    const transform = TransformComponent.matrix[entity];
    device.queue.writeBuffer(
      uniformBuffer,
      offset,
      transform.buffer,
      transform.byteOffset,
      transform.byteLength
    );

    offset += transform.byteLength;
  };

  const reset = () => {
    offset = 0;
  };

  return {
    bindGroups: [uniformBindGroup],
    pipeline: materialPipeline,
    update: updateNormalMaterialInstance,
    reset,
  };
};
