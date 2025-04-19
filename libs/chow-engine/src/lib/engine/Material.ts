import { Component } from 'bitecs';

export interface MaterialPipeline {
  pipeline: GPURenderPipeline;
  instanceSlot: number;
}

export interface ShaderResource {
  binding: number;
  bindGroup?: number;
  resource: GPUBindingResource;
}

export interface ResourceUpdateSchema {
  component: Component;
  resourceIndex: number;
  stride: number;
}

export interface MaterialInstance {
  bindGroups: GPUBindGroup[];
  resources: ShaderResource[];
  pipeline: MaterialPipeline;
  update: (entity: number, resources: ShaderResource[]) => void;
}

export class MaterialStore {
  private _materials: (MaterialInstance | null)[] = [];

  public get(index: number): MaterialInstance | null {
    return this._materials.at(index) ?? null;
  }

  public addMaterial(material: MaterialInstance) {
    const nextIndex = this._materials.length;
    this._materials.push(material);
    return nextIndex;
  }

  public get materials() {
    return this._materials;
  }
}
