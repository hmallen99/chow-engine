import { addComponent, IWorld } from 'bitecs';
import {
  MaterialInstance,
  Mesh,
  ModelComponent,
  Scene,
  TransformComponent,
} from '../chow-engine.js';
import { Entity } from './Entity.js';
import { Mat4 } from 'wgpu-matrix';

export class ModelEntity<T extends MaterialInstance> extends Entity {
  constructor(world: IWorld, scene: Scene, mesh: Mesh, private _material: T) {
    super(world);
    addComponent(world, ModelComponent, this.eid);
    addComponent(world, TransformComponent, this.eid);
    const meshId = scene.meshStore.addMesh(mesh);
    ModelComponent.mesh[this.eid] = meshId;
    const materialId = scene.materialStore.addMaterial(_material);
    ModelComponent.materials[this.eid][0] = materialId;
  }

  public set transform(transform: Mat4) {
    TransformComponent.matrix[this.id].set(transform, 0);
    this.material.updateTransform?.();
  }

  public get material() {
    return this._material;
  }
}
