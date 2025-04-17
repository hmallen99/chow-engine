import { IWorld } from 'bitecs';
import { Engine } from './Engine.js';
import { MaterialStore } from './Material.js';
import { MeshStore } from './Mesh.js';
import { createRenderer, Renderer } from './Renderer.js';

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

  constructor(engine: Engine, world: IWorld) {
    this._engine = engine;
    this._meshStore = new MeshStore(world);
    this._renderer = createRenderer(
      world,
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
}
