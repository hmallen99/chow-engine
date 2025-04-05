import { cubeVertexSize, cubeUVOffset, cubePositionOffset } from './cube.js';
import {
  vertex as instancedVertWGSL,
  fragment as vertexPositionColorWGSL,
} from './shader.js';

export const createNormalMaterial = (
  device: GPUDevice,
  presentationFormat: GPUTextureFormat,
  numInstances: number
) => {
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

  const matrixFloatCount = 16; // 4x4 matrix
  const matrixSize = 4 * matrixFloatCount;
  const uniformBufferSize = numInstances * matrixSize;

  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
    ],
  });

  return { pipeline, uniformBindGroup, uniformBuffer, size: 0 };
};
