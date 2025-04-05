import { Scene } from './Scene.js';

/**
 * The Basic WebGPU Engine.
 * Contains logic for managing scenes and initializing
 * the WebGPU rendering context.
 */
export class Engine {
  private scenes: Scene[] = [];

  public createScene() {
    const nextScene = new Scene(this);
    this.scenes.push(nextScene);
    return nextScene;
  }
}
