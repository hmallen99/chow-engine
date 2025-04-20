import { Scene, ShaderResource, TransformComponent } from '../chow-engine.js';
import {
  ShaderMaterialInstance,
  ShaderMaterialPipeline,
} from './ShaderMaterial.js';
import {
  StandardMaterialFragment,
  StandardMaterialVert,
} from './shaders/StandardMaterialShader.js';

class StandardMaterialPipeline extends ShaderMaterialPipeline {
  constructor(scene: Scene) {
    super(
      scene,
      {
        vertex: StandardMaterialVert,
        fragment: StandardMaterialFragment,
      },
      [
        { arrayStride: 4 * 4, format: 'float32x4' },
        { arrayStride: 2 * 4, format: 'float32x2' },
      ]
    );
  }
}

const MATRIX_SIZE = 4 * 16;
const BUFFER_ALIGNMENT_OFFSET = 256;
const INITIAL_CAPACITY = 256;

export class StandardMaterialInstance extends ShaderMaterialInstance {
  constructor(
    scene: Scene,
    pipeline: ShaderMaterialPipeline,
    private index: number,
    private eid: number,
    bindGroupEntries: ShaderResource[]
  ) {
    super(scene, pipeline, bindGroupEntries);
  }

  public updateTransformMatrix() {
    const matrix = TransformComponent.matrix[this.eid];
    this.setUniformBuffer(matrix, 0, this.index * BUFFER_ALIGNMENT_OFFSET);
  }
}

export class StandardMaterialBuilder {
  private _matrixBuffer: GPUBuffer;
  private _device;
  private _instanceCount = 0;
  private _pipeline;

  constructor(private _scene: Scene) {
    this._device = _scene.engine.session.device;
    this._pipeline = new StandardMaterialPipeline(_scene);

    const initialSize =
      (INITIAL_CAPACITY - 1) * BUFFER_ALIGNMENT_OFFSET + MATRIX_SIZE;

    this._matrixBuffer = this._device.createBuffer({
      size: initialSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  // TODO: handle resize
  public createInstance(eid: number): StandardMaterialInstance {
    const index = this._instanceCount++;
    const instanceOffset = index * BUFFER_ALIGNMENT_OFFSET;

    return new StandardMaterialInstance(
      this._scene,
      this._pipeline,
      index,
      eid,
      [
        {
          binding: 0,
          resource: {
            buffer: this._matrixBuffer,
            offset: instanceOffset,
            size: MATRIX_SIZE,
          },
        },
      ]
    );
  }
}
