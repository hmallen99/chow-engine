import {
  MaterialInstance,
  MaterialPipeline,
  Scene,
  ShaderResource,
} from '../chow-engine.js';

export interface ShaderCode {
  vertex: string;
  fragment?: string;
}

export interface SimpleVertexBufferDescriptor {
  arrayStride: number;
  format: GPUVertexFormat;
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
        buffers: vertexBuffers.map(({ arrayStride, format }, index) => {
          return {
            arrayStride,
            attributes: [
              {
                shaderLocation: index,
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
  private _resources;
  private _device;

  constructor(
    scene: Scene,
    pipeline: ShaderMaterialPipeline,
    bindGroupEntries: ShaderResource[],
    private _update = (entity: number, instance: ShaderMaterialInstance) => {}
  ) {
    this._pipeline = pipeline;

    const device = scene.engine.session.device;
    this._device = device;
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
    this._resources = bindGroupEntries;
  }

  public get bindGroups() {
    return this._bindGroups;
  }

  public get resources() {
    return this._resources;
  }

  public update(entity: number) {
    this._update(entity, this);
  }

  public setUniformBuffer(
    data: Float32Array,
    resourceIndex: number,
    offset: number
  ) {
    const resource = this._resources[resourceIndex]
      .resource as GPUBufferBinding;
    this._device.queue.writeBuffer(
      resource.buffer,
      offset,
      data.buffer,
      data.byteOffset,
      data.byteLength
    );
  }

  public get pipeline() {
    return this._pipeline;
  }
}
