import { removeEntity } from 'bitecs';
import { MaterialInstance, Mesh, ModelEntity, Scene } from '../chow-engine.js';
import { MaterialBuilder } from '../materials/MaterialBuilder.js';
import { Entity } from './Entity.js';

export class EntityStore {
  private _entities: Map<number, Entity> = new Map();

  public constructor(private scene: Scene) {}

  public createEntity() {
    const entity = new Entity(this.scene);
    this._entities.set(entity.eid, entity);
    return entity;
  }

  public createModelEntity<T extends MaterialInstance>(
    mesh: Mesh,
    materialBuilder: MaterialBuilder<T>
  ) {
    const entity = new ModelEntity(this.scene, mesh, materialBuilder);
    this._entities.set(entity.eid, entity);
    return entity;
  }

  public getEntity(eid: number) {
    return this._entities.get(eid);
  }

  public removeEntity(eid: number) {
    const entity = this._entities.get(eid);
    if (entity) {
      removeEntity(this.scene.world, eid);
      this._entities.delete(eid);
    }
  }
}
