import { IWorld, removeEntity } from 'bitecs';
import { Engine } from './Engine.js';
import { MaterialInstance, MaterialStore } from './Material.js';
import { Mesh, MeshStore } from './Mesh.js';
import { createRenderer, Renderer } from './Renderer.js';
import { Entity, ModelEntity } from '../chow-engine.js';
import { MaterialBuilder } from '../materials/MaterialBuilder.js';

/**
 * Scene
 *
 * A class to store meshes, materials, textures, etc.
 * used to render the active scene. Contains a
 * reference to the parent engine.
 */
export class Scene {
  private _meshStore;
  private _materialStore = new MaterialStore();
  private _engine: Engine;
  private _renderer: Renderer;
  private _entities: Map<number, Entity> = new Map();

  constructor(engine: Engine, private _world: IWorld) {
    this._engine = engine;
    this._meshStore = new MeshStore(_world);
    this._renderer = createRenderer(
      _world,
      engine.session.device,
      engine.canvas
    );
  }

  public get engine() {
    return this._engine;
  }

  public get meshStore() {
    return this._meshStore;
  }

  public get materialStore() {
    return this._materialStore;
  }

  public get renderer() {
    return this._renderer;
  }

  public get world() {
    return this._world;
  }

  public createEntity() {
    const entity = new Entity(this);
    this._entities.set(entity.eid, entity);
    return entity;
  }

  public createModelEntity<T extends MaterialInstance>(
    mesh: Mesh,
    materialBuilder: MaterialBuilder<T>
  ) {
    const entity = new ModelEntity(this, mesh, materialBuilder);
    this._entities.set(entity.eid, entity);
    return entity;
  }

  public getEntity(eid: number) {
    return this._entities.get(eid);
  }

  public removeEntity(eid: number) {
    const entity = this._entities.get(eid);
    if (entity) {
      removeEntity(this._world, eid);
      this._entities.delete(eid);
    }
  }
}
