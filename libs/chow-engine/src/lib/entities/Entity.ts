import { addEntity } from 'bitecs';
import { Scene } from '../chow-engine.js';

export class Entity {
  private _eid: number;

  constructor(protected scene: Scene) {
    this._eid = addEntity(scene.world);
  }

  public get eid() {
    return this._eid;
  }
}
