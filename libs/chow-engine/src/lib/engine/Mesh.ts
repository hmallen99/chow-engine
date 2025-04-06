import { addComponent, addEntity, IWorld } from 'bitecs';
import { MeshStoreComponent } from '../components/MeshStoreComponent.js';

export interface Mesh {
  indices?: Float32Array;
  vertices?: Float32Array;
}

export class MeshStore {
  private _meshes: (Mesh | null)[] = [];
  private storeEntity;

  constructor(world: IWorld) {
    this.storeEntity = addEntity(world);
    addComponent(world, MeshStoreComponent, this.storeEntity);
    MeshStoreComponent.dirty[this.storeEntity] = 0;
  }

  public get(index: number): Mesh | null {
    return this._meshes.at(index) ?? null;
  }

  public get meshes() {
    return this._meshes;
  }

  public addMesh(mesh: Mesh): number {
    const nextMeshCount = this._meshes.length;
    this._meshes.push(mesh);
    MeshStoreComponent.dirty[this.storeEntity] = 1;
    return nextMeshCount;
  }
}
