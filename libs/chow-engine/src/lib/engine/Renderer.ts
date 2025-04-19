import { addComponent, addEntity, IWorld } from 'bitecs';
import { InstanceBufferComponent } from '../components/InstanceBufferComponent.js';
import { MaterialPipeline, MaterialInstance } from './Material.js';
import { Mesh, MeshInstance } from './Mesh.js';

const INITIAL_CAPACITY = 1024;
export const INSTANCE_SIZE_F32 = 40;

type MaterialInstanceMeshInstanceMap = Map<MaterialInstance, MeshInstance>;
type MeshMaterialInstanceMap = Map<Mesh, MaterialInstanceMeshInstanceMap>;
type MaterialMap = Map<MaterialPipeline, MeshMaterialInstanceMap>;

export class RenderBatch {
  private _instanceArray: Float32Array;
  private _instanceCount: number;
  private _instanceBuffer: GPUBuffer;
  private _materialMap: MaterialMap = new Map();
  private _renderBatchEntity;

  constructor(
    world: IWorld,
    device: GPUDevice,
    capacity: number,
    instanceSize: number
  ) {
    this._renderBatchEntity = addEntity(world);
    addComponent(world, InstanceBufferComponent, this._renderBatchEntity);
    InstanceBufferComponent.dirty[this._renderBatchEntity] = 0;

    const size = instanceSize * capacity;
    this._instanceArray = new Float32Array(size);
    this._instanceCount = 0;
    this._instanceBuffer = device.createBuffer({
      size: size * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
  }

  get instanceArray() {
    return this._instanceArray;
  }

  get instanceCount() {
    return this._instanceCount;
  }

  get instanceBuffer() {
    return this._instanceBuffer;
  }

  get materialMap() {
    return this._materialMap;
  }

  public addInstance(
    material: MaterialPipeline,
    mesh: Mesh,
    materialInstance: MaterialInstance,
    modelId: number
  ): number {
    InstanceBufferComponent.dirty[this._renderBatchEntity] = 1;
    let meshMaterials = this._materialMap.get(material);
    if (!meshMaterials) {
      meshMaterials = new Map();
      this._materialMap.set(material, meshMaterials);
    }

    let materialInstances = meshMaterials.get(mesh);
    if (!materialInstances) {
      materialInstances = new Map();
      meshMaterials.set(mesh, materialInstances);
    }

    let instances = materialInstances.get(materialInstance);
    if (!instances) {
      instances = { instanceCount: 0, bufferOffset: 0, entities: [] };
      materialInstances.set(materialInstance, instances);
    }
    instances.instanceCount++;
    instances.entities.push(modelId);

    return this._instanceCount++;
  }

  public clear() {
    this._materialMap = new Map();
    this._instanceCount = 0;
    InstanceBufferComponent.dirty[this._renderBatchEntity] = 1;
  }
}

export interface Renderer {
  renderBatch: RenderBatch;
  renderPassDescriptor: GPURenderPassDescriptor;
  depthTexture: GPUTexture;
  device: GPUDevice;
}

export const createRenderer = (
  world: IWorld,
  device: GPUDevice,
  canvas: HTMLCanvasElement
): Renderer => {
  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: undefined as unknown as GPUTextureView, // Assigned later

        clearValue: [0.5, 0.5, 0.5, 1.0],
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),

      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    },
  };

  return {
    renderBatch: new RenderBatch(
      world,
      device,
      INITIAL_CAPACITY,
      INSTANCE_SIZE_F32
    ),
    renderPassDescriptor,
    depthTexture,
    device,
  };
};
