import { defineQuery, defineSystem } from 'bitecs';
import { TransformComponent } from '../components/TransformComponent.js';
import { ModelComponent } from '../components/ModelComponent.js';
import { Scene } from '../engine/Scene.js';
import { createNormalMaterial } from '../cube/normalMat.js';
import { cubeVertexArray } from '../cube/cube.js';
import { writeVertices } from '../engine/Renderer.js';

export function createRenderSystem(scene: Scene) {
  const renderQuery = defineQuery([TransformComponent, ModelComponent]);

  const renderer = scene.engine.renderer;
  const device = renderer.device;

  // START: temp code, should be in example app
  // TODO: move to material
  const { pipeline, uniformBindGroup, uniformBuffer } = createNormalMaterial(
    device,
    scene.engine.format,
    16
  );

  // TODO: move to mesh
  writeVertices(renderer, cubeVertexArray);

  // END temp code

  return defineSystem((world) => {
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
