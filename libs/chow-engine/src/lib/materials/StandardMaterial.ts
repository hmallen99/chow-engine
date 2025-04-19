import { Scene } from '../chow-engine.js';
import {
  ShaderMaterialInstance,
  ShaderMaterialPipeline,
} from './ShaderMaterial.js';
import {
  StandardMaterialFragment,
  StandardMaterialVert,
} from './shaders/StandardMaterialShader.js';

export class StandardMaterialPipeline extends ShaderMaterialPipeline {
  constructor(scene: Scene) {
    super(
      scene,
      {
        vertex: StandardMaterialVert,
        fragment: StandardMaterialFragment,
      },
      // TODO: set position, normal, uv, etc.
      [{ arrayStride: 4, format: 'float32x4' }]
    );
  }
}

export class StandardMaterialInstance extends ShaderMaterialInstance {
  constructor(scene: Scene, pipeline: ShaderMaterialPipeline) {
    super(scene, pipeline, []);
  }

  // TODO: set diffuse color, ambient color, texture, etc.
}
