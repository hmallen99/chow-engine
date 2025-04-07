import { defineQuery, defineSystem } from 'bitecs';
import { TransformComponent } from '../components/TransformComponent.js';
import { ModelComponent } from '../components/ModelComponent.js';
import { Scene } from '../engine/Scene.js';
import { InstanceBufferComponent } from '../components/InstanceBufferComponent.js';
import { INSTANCE_SIZE_F32 } from '../engine/Renderer.js';

export function createRenderSystem(scene: Scene) {
  const renderQuery = defineQuery([TransformComponent, ModelComponent]);
  const instanceBufferQuery = defineQuery([InstanceBufferComponent]);

  const renderer = scene.renderer;
  const device = renderer.device;

  return defineSystem((world) => {
    const instanceBufferEntity = instanceBufferQuery(world).at(0);
    if (
      instanceBufferEntity !== undefined &&
      InstanceBufferComponent.dirty[instanceBufferEntity]
    ) {
      let instanceCount = 0;
      for (const meshMaterials of renderer.renderBatch.materialMap.values()) {
        for (const materialInstances of meshMaterials.values()) {
          for (const instances of materialInstances.values()) {
            instances.bufferOffset = instanceCount * 4;

            for (let i = 0; i < instances.entities.length; i++) {
              const eid = instances.entities[i];
              const arrayOffset = instanceCount * INSTANCE_SIZE_F32;

              renderer.renderBatch.instanceArray.set(
                TransformComponent.matrix[eid],
                arrayOffset
              );
              instanceCount++;
            }
          }
        }
      }

      InstanceBufferComponent.dirty[instanceBufferEntity] = 0;
    }

    for (const entity of renderQuery(world)) {
      const transform = TransformComponent.matrix[entity];
      const meshId = ModelComponent.mesh[entity];
      const mesh = scene.meshStore.get(meshId);

      const materialId = ModelComponent.materials[entity][0];
      const materialInstance = scene.materialStore.get(materialId);
      if (materialInstance && mesh) {
        materialInstance.update(transform);
        scene.renderer.renderBatch.addInstance(
          materialInstance.material,
          mesh,
          materialInstance,
          entity
        );
      }
    }

    (
      renderer.renderPassDescriptor
        .colorAttachments as GPURenderPassColorAttachment[]
    )[0].view = scene.engine.context.getCurrentTexture().createView();

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(
      renderer.renderPassDescriptor
    );

    const materialMap = renderer.renderBatch.materialMap;
    for (const [material, meshMap] of materialMap) {
      passEncoder.setPipeline(material.pipeline);

      for (const [mesh, materials] of meshMap) {
        for (const vb of mesh.vertexBuffers) {
          passEncoder.setVertexBuffer(vb.slot, vb.buffer, vb.offset);
        }

        if (mesh.indexBuffer) {
          passEncoder.setIndexBuffer(
            mesh.indexBuffer.buffer,
            mesh.indexBuffer.format,
            mesh.indexBuffer.offset
          );
        }

        for (const [materialInstance, instances] of materials) {
          const bindGroups = materialInstance.bindGroups;
          for (let i = 0; i < bindGroups.length; i++) {
            passEncoder.setBindGroup(i, bindGroups[i]);
          }

          if (material.instanceSlot >= 0) {
            passEncoder.setVertexBuffer(
              0,
              renderer.renderBatch.instanceBuffer,
              instances.bufferOffset
            );
          }

          if (mesh.indexBuffer) {
            passEncoder.drawIndexed(mesh.drawCount, instances.instanceCount);
          } else {
            passEncoder.draw(mesh.drawCount, instances.instanceCount);
          }
        }
      }
    }

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    for (const material of scene.materialStore.materials) {
      material?.reset();
    }

    return world;
  });
}
