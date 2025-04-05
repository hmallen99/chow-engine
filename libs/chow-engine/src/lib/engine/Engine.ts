import { Scene } from './Scene.js';

/**
 * The Basic WebGPU Engine.
 * Contains logic for managing scenes and initializing
 * the WebGPU rendering context.
 */
export class Engine {
  private scenes: Scene[] = [];
  private _canvas: HTMLCanvasElement;
  private _context: GPUCanvasContext;
  private _ready = false;
  private _adapter: GPUAdapter | null = null;
  private _device: GPUDevice | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    const context = canvas.getContext('webgpu');
    if (!context) throw new Error('Failed to intialize WebGPU context');
    this._context = context;

    navigator.gpu
      ?.requestAdapter({
        featureLevel: 'compatibility',
      })
      .then((adapter) => {
        this._adapter = adapter;
        return adapter?.requestDevice();
      })
      .then((device) => {
        this._device = device ?? null;
        this._ready = !!this._device && !!this._adapter;
      });
  }

  public createScene() {
    const nextScene = new Scene(this);
    this.scenes.push(nextScene);
    return nextScene;
  }

  public get adapter() {
    return this._adapter;
  }

  public get device() {
    return this._device;
  }

  public get ready() {
    return this._ready;
  }

  public get canvas() {
    return this._canvas;
  }

  public get context() {
    return this._context;
  }
}
