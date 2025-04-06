import { defineQuery, defineSystem } from 'bitecs';
import { TransformComponent } from '../components/TransformComponent.js';
import { ModelComponent } from '../components/ModelComponent.js';
import { Scene } from '../engine/Scene.js';
import { createNormalMaterial } from '../cube/normalMat.js';
import { MeshStoreComponent } from '../components/MeshStoreComponent.js';

export function createRenderSystem(scene: Scene) {
  const renderQuery = defineQuery([TransformComponent, ModelComponent]);
  const meshStoreQuery = defineQuery([MeshStoreComponent]);

  const renderer = scene.engine.renderer;
  const device = renderer.device;

  // START: temp code, should be in example app
  // TODO: move to material
  const { pipeline, uniformBindGroup, uniformBuffer } = createNormalMaterial(
    device,
    scene.engine.format,
    16
  );

  // END temp code

  return defineSystem((world) => {
    const meshStoreEntity = meshStoreQuery(world).at(0);
    if (
      meshStoreEntity !== undefined &&
      MeshStoreComponent.dirty[meshStoreEntity]
    ) {
      const meshes = scene.meshStore.meshes;
      let offset = 0;
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        const vertices = mesh?.vertices;
        if (vertices) {
          renderer.renderBatch.instanceArray.set(vertices, offset);
          offset += vertices.byteLength;
        }
      }

      renderer.device.queue.writeBuffer(
        renderer.renderBatch.instanceBuffer,
        0,
        renderer.renderBatch.instanceArray,
        0,
        offset
      );

      MeshStoreComponent.dirty[meshStoreEntity] = 0;
    }

    // TODO: make generic for multiple buffers, bindGroups
    let offset = 0;
    let numInstances = 0;
    for (const entity of renderQuery(world)) {
      const transform = TransformComponent.matrix[entity];
      device.queue.writeBuffer(
        uniformBuffer,
        offset,
        transform.buffer,
        transform.byteOffset,
        transform.byteLength
      );
      offset += transform.byteLength;
      numInstances++;
    }

    (
      renderer.renderPassDescriptor
        .colorAttachments as GPURenderPassColorAttachment[]
    )[0].view = scene.engine.context.getCurrentTexture().createView();

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(
      renderer.renderPassDescriptor
    );
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setVertexBuffer(0, renderer.renderBatch.instanceBuffer);
    passEncoder.draw(renderer.renderBatch.instanceCount, numInstances, 0, 0);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    return world;
  });
}
