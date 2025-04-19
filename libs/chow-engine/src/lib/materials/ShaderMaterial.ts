import { MaterialInstance, MaterialPipeline, Scene } from '../chow-engine.js';

export interface ShaderCode {
  vertex: string;
  fragment?: string;
}

export interface SimpleVertexBufferDescriptor {
  arrayStride: number;
  format: GPUVertexFormat;
}

export interface ShaderResource {
  binding: number;
  bindGroup?: number;
  resource: GPUBindingResource;
}

export class ShaderMaterialPipeline implements MaterialPipeline {
  private _pipeline;

  constructor(
    scene: Scene,
    shaderCode: ShaderCode,
    vertexBuffers: SimpleVertexBufferDescriptor[]
  ) {
    const device = scene.engine.session.device;
    const presentationFormat = scene.engine.format;
    this._pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({ code: shaderCode.vertex }),
        buffers: vertexBuffers.map(({ arrayStride, format }) => {
          return {
            arrayStride,
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format,
              },
            ],
          };
        }),
      },
      fragment: shaderCode.fragment
        ? {
            module: device.createShaderModule({
              code: shaderCode.fragment,
            }),
            targets: [
              {
                format: presentationFormat,
              },
            ],
          }
        : undefined,
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
  }

  public get pipeline() {
    return this._pipeline;
  }

  public get instanceSlot() {
    return -1;
  }
}

export class ShaderMaterialInstance implements MaterialInstance {
  private _bindGroups;
  private _pipeline;

  constructor(
    scene: Scene,
    pipeline: ShaderMaterialPipeline,
    bindGroupEntries: ShaderResource[]
  ) {
    this._pipeline = pipeline;
    const device = scene.engine.session.device;
    const bindGroupMap = new Map<number, GPUBindGroupEntry[]>();
    for (const bindGroupEntry of bindGroupEntries) {
      const bindGroupIndex = bindGroupEntry.bindGroup ?? 0;
      let bindGroup = bindGroupMap.get(bindGroupIndex);
      if (!bindGroup) {
        bindGroup = [];
        bindGroupMap.set(bindGroupIndex, bindGroup);
      }
      bindGroup.push({
        binding: bindGroupEntry.binding,
        resource: bindGroupEntry.resource,
      });
    }

    const bindGroups: GPUBindGroup[] = [];
    for (const [index, entries] of bindGroupMap.entries()) {
      bindGroups.push(
        device.createBindGroup({
          layout: pipeline.pipeline.getBindGroupLayout(index),
          entries,
        })
      );
    }

    this._bindGroups = bindGroups;
  }

  public get bindGroups() {
    return this._bindGroups;
  }

  public update() {}

  public reset() {}

  public get pipeline() {
    return this._pipeline;
  }
}
