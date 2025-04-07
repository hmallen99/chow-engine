import { Mat4 } from 'wgpu-matrix';

export interface Material {
  pipeline: GPURenderPipeline;
  instanceSlot: number;
  bindGroupLayouts: [GPUBindGroupLayout];
}

// TODO: how to update MaterialInstance generically?
export interface MaterialInstance {
  bindGroups: GPUBindGroup[];
  material: Material;
  // TODO: what params does this need?
  update: (transform: Mat4) => void;
  reset: () => void;
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
