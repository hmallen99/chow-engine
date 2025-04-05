import { Engine } from './Engine.js';
import { MaterialStore } from './Material.js';
import { MeshStore } from './Mesh.js';

export class Scene {
  private _meshStore = new MeshStore();
  private _materialStore = new MaterialStore();
  private _engine: Engine;

  constructor(engine: Engine) {
    this._engine = engine;
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
}
