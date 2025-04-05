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
  private _session: WebGPUSession;

  constructor(canvas: HTMLCanvasElement, session: WebGPUSession) {
    this._canvas = canvas;
    const context = canvas.getContext('webgpu');
    if (!context) throw new Error('Failed to intialize WebGPU context');
    this._context = context;
    this._session = session;
  }

  public createScene() {
    const nextScene = new Scene(this);
    this.scenes.push(nextScene);
    return nextScene;
  }

  public get session() {
    return this._session;
  }

  public get canvas() {
    return this._canvas;
  }

  public get context() {
    return this._context;
  }
}

export interface WebGPUSession {
  adapter: GPUAdapter;
  device: GPUDevice;
}

export const initWebGPUSession = async (): Promise<WebGPUSession> => {
  const adapter = await navigator.gpu?.requestAdapter({
    featureLevel: 'compatibility',
  });

  if (!adapter) throw new Error('Failed to initialize WebGPU Adapter');

  const device = await adapter?.requestDevice();
  if (!device) throw new Error('Failed to initialize WebGPU Device');

  return { adapter, device };
};
