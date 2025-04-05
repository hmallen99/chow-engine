export interface Mesh {
  indices?: Float32Array;
  positions?: Float32Array;
}

export class MeshStore {
  private meshes: (Mesh | null)[] = [];

  public get(index: number): Mesh | null {
    return this.meshes.at(index) ?? null;
  }
}
