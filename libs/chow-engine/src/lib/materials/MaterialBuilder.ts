import { MaterialInstance } from '../chow-engine.js';

export abstract class MaterialBuilder<T extends MaterialInstance> {
  public abstract createInstance(eid: number): T;
}
