import { addEntity, IWorld, removeEntity } from 'bitecs';

export class Entity {
  protected eid: number;

  constructor(protected world: IWorld) {
    this.eid = addEntity(world);
  }

  public get id() {
    return this.eid;
  }

  public dispose() {
    removeEntity(this.world, this.eid);
  }
}
