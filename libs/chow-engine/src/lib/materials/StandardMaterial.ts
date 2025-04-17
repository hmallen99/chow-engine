import { MaterialInstance, MaterialPipeline, Scene } from '../chow-engine.js';
import {
  StandardMaterialFragment,
  StandardMaterialVert,
} from './shaders/StandardMaterialShader.js';

const FLOAT_SIZE = 4;
const VERTEX_SIZE = FLOAT_SIZE * 10;
const POSITION_OFFSET = 0;
const UV_OFFSET = FLOAT_SIZE * 8;

export class StandardMaterial {
  public static CreatePipeline(scene: Scene): MaterialPipeline {
    const device = scene.engine.session.device;
    const presentationFormat = scene.engine.format;
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({ code: StandardMaterialVert }),
        buffers: [
          {
            arrayStride: VERTEX_SIZE,
            attributes: [
              {
                // position
                shaderLocation: 0,
                offset: POSITION_OFFSET,
                format: 'float32x4',
              },
              {
                // uv
                shaderLocation: 1,
                offset: UV_OFFSET,
                format: 'float32x2',
              },
            ],
          },
        ],
      },
      fragment: {
        module: device.createShaderModule({
          code: StandardMaterialFragment,
        }),
        targets: [
          {
            format: presentationFormat,
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back',
      },
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
  }

  public static CreateInstance(pipeline: MaterialPipeline): MaterialInstance {
    return {
      update: () => {},
      pipeline,
      bindGroups: [],
      reset: () => {},
    };
  }
}
