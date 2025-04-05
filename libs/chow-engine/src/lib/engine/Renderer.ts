const INITIAL_CAPACITY = 1024;
const INSTANCE_SIZE_F32 = 40;

export interface RenderBatch {
  instanceArray: Float32Array;
  instanceCount: number;
  instanceBuffer: GPUBuffer;
}

export const createRenderBatch = (
  device: GPUDevice,
  capacity: number,
  instanceSize: number
): RenderBatch => {
  const size = instanceSize * capacity;
  return {
    instanceArray: new Float32Array(size),
    instanceCount: capacity,
    instanceBuffer: device.createBuffer({
      size: size * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    }),
  };
};

export const writeVertices = (renderer: Renderer, vertices: Float32Array) => {
  renderer.renderBatch.instanceArray.set(vertices);

  renderer.device.queue.writeBuffer(
    renderer.renderBatch.instanceBuffer,
    0,
    renderer.renderBatch.instanceArray,
    0,
    vertices.length * INSTANCE_SIZE_F32
  );
};

export interface Renderer {
  renderBatch: RenderBatch;
  renderPassDescriptor: GPURenderPassDescriptor;
  depthTexture: GPUTexture;
  device: GPUDevice;
}

export const createRenderer = (
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
    renderBatch: createRenderBatch(device, INITIAL_CAPACITY, INSTANCE_SIZE_F32),
    renderPassDescriptor,
    depthTexture,
    device,
  };
};
