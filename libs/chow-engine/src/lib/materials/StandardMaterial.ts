import { Vec3, vec4 } from 'wgpu-matrix';
import { Scene, ShaderResource, TransformComponent } from '../chow-engine.js';
import {
  ShaderMaterialInstance,
  ShaderMaterialPipeline,
} from './ShaderMaterial.js';
import { StandardMaterialModule } from './shaders/StandardMaterialShader.js';

class StandardMaterialPipeline extends ShaderMaterialPipeline {
  constructor(scene: Scene) {
    super(
      scene,
      {
        vertex: StandardMaterialModule,
        fragment: StandardMaterialModule,
      },
      [
        { arrayStride: 4 * 4, format: 'float32x4' },
        { arrayStride: 2 * 4, format: 'float32x2' },
        { arrayStride: 3 * 4, format: 'float32x3' },
      ]
    );
  }
}

const MATRIX_SIZE = 4 * 16;
const BUFFER_ALIGNMENT_OFFSET = 256;
const INITIAL_CAPACITY = 256;

const COLOR_INFO_SIZE = 4 * 4;
const LIGHT_INFO_SIZE = 256;

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

  public updateAmbientColor(color: Vec3, strength = 1) {
    this.setUniformBuffer(
      vec4.create(color[0], color[1], color[2], strength),
      1,
      this.index * BUFFER_ALIGNMENT_OFFSET
    );
  }
}

// TODO: make this generic for ShaderMaterials
export class StandardMaterialBuilder {
  private _matrixBuffer: GPUBuffer;
  private _colorBuffer;
  private _lightBuffer;
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

    this._colorBuffer = this._device.createBuffer({
      size: (INITIAL_CAPACITY - 1) * BUFFER_ALIGNMENT_OFFSET + COLOR_INFO_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // TODO: extract to light class to allow for reuse
    this._lightBuffer = this._device.createBuffer({
      size: LIGHT_INFO_SIZE,
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
        {
          binding: 1,
          resource: {
            buffer: this._colorBuffer,
            offset: instanceOffset,
            size: COLOR_INFO_SIZE,
          },
        },
        {
          binding: 2,
          resource: {
            buffer: this._lightBuffer,
            offset: 0,
            size: LIGHT_INFO_SIZE,
          },
        },
      ]
    );
  }

  public setLight(color: Vec3, position: Vec3) {
    this._device.queue.writeBuffer(this._lightBuffer, 0, color);
    this._device.queue.writeBuffer(
      this._lightBuffer,
      color.byteLength,
      position
    );
  }
}
