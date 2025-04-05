export interface Material {}

export class MaterialStore {
  private materials: (Material | null)[] = [];

  public get(index: number): Material | null {
    return this.materials.at(index) ?? null;
  }
}
