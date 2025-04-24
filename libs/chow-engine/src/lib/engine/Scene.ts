import { IWorld } from 'bitecs';
import { Engine } from './Engine.js';
import { MaterialStore } from './Material.js';
import { MeshStore } from './Mesh.js';
import { createRenderer, Renderer } from './Renderer.js';
import { EntityStore } from '../entities/EntityStore.js';

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
  private _entityStore;

  constructor(engine: Engine, private _world: IWorld) {
    this._engine = engine;
    this._meshStore = new MeshStore(_world);
    this._entityStore = new EntityStore(this);
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

  public get entityStore() {
    return this._entityStore;
  }

  public get renderer() {
    return this._renderer;
  }

  public get world() {
    return this._world;
  }
}
