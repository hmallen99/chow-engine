import { Scene } from './scene.js';

export class Engine {
  private scenes: Scene[] = [];

  public createScene() {
    const nextScene = new Scene(this);
    this.scenes.push(nextScene);
    return nextScene;
  }
}
