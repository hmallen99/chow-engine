import { addComponent } from 'bitecs';
import {
  MaterialInstance,
  Mesh,
  ModelComponent,
  Scene,
  TransformComponent,
} from '../chow-engine.js';
import { Entity } from './Entity.js';
import { Mat4 } from 'wgpu-matrix';
import { MaterialBuilder } from '../materials/MaterialBuilder.js';

export class ModelEntity<T extends MaterialInstance> extends Entity {
  private _material: T;

  constructor(
    scene: Scene,
    mesh: Mesh, // TODO: allow passing MeshDescriptor or MeshBuilder
    materialBuilder: MaterialBuilder<T> // TODO: allow passing material descriptor
  ) {
    super(scene);
    addComponent(scene.world, ModelComponent, this.eid);
    addComponent(scene.world, TransformComponent, this.eid);
    const meshId = scene.meshStore.addMesh(mesh);
    ModelComponent.mesh[this.eid] = meshId;

    this._material = materialBuilder.createInstance(this.eid);
    const materialId = scene.materialStore.addMaterial(this._material);
    ModelComponent.materials[this.eid][0] = materialId;
  }

  public set transform(transform: Mat4) {
    TransformComponent.matrix[this.eid].set(transform, 0);
    this.material.updateTransform?.();
  }

  public get material() {
    return this._material;
  }
}
