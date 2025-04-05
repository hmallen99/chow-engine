import { defineQuery, defineSystem } from 'bitecs';
import { TransformComponent } from '../components/TransformComponent.js';
import { ModelComponent } from '../components/ModelComponent.js';
import { Scene } from '../engine/Scene.js';
import { createNormalMaterial } from '../cube/normalMat.js';
import { mat4, Mat4, vec3 } from 'wgpu-matrix';
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

  writeVertices(renderer, cubeVertexArray);

  // TODO: move to example app
  const xCount = 4;
  const yCount = 4;
  const numInstances = xCount * yCount;
  const matrixFloatCount = 16; // 4x4 matrix

  const aspect = scene.engine.canvas.width / scene.engine.canvas.height;
  const projectionMatrix = mat4.perspective(
    (2 * Math.PI) / 5,
    aspect,
    1,
    100.0
  );

  const modelMatrices = new Array<Mat4>(numInstances);
  const mvpMatricesData = new Float32Array(matrixFloatCount * numInstances);

  const step = 4.0;

  // Initialize the matrix data for every instance.
  let m = 0;
  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      modelMatrices[m] = mat4.translation(
        vec3.fromValues(
          step * (x - xCount / 2 + 0.5),
          step * (y - yCount / 2 + 0.5),
          0
        )
      );
      m++;
    }
  }

  const viewMatrix = mat4.translation(vec3.fromValues(0, 0, -12));

  const tmpMat4 = mat4.create();

  function updateTransformationMatrix() {
    const now = Date.now() / 1000;

    let m = 0,
      i = 0;
    for (let x = 0; x < xCount; x++) {
      for (let y = 0; y < yCount; y++) {
        mat4.rotate(
          modelMatrices[i],
          vec3.fromValues(
            Math.sin((x + 0.5) * now),
            Math.cos((y + 0.5) * now),
            0
          ),
          1,
          tmpMat4
        );

        mat4.multiply(viewMatrix, tmpMat4, tmpMat4);
        mat4.multiply(projectionMatrix, tmpMat4, tmpMat4);

        mvpMatricesData.set(tmpMat4, m);

        i++;
        m += matrixFloatCount;
      }
    }
  }

  // END temp code

  return defineSystem((world) => {
    for (const entity of renderQuery(world)) {
      console.log(
        TransformComponent.position.x[entity],
        TransformComponent.position.y[entity],
        TransformComponent.position.z[entity],
        ModelComponent.materials[entity],
        ModelComponent.materials[entity]
      );
    }

    // TODO: replace with generic code
    updateTransformationMatrix();
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      mvpMatricesData.buffer,
      mvpMatricesData.byteOffset,
      mvpMatricesData.byteLength
    );

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
