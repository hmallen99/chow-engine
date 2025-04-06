import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createWorld, Engine, createRenderSystem, pipe, initWebGPUSession } from "@chow/chow-engine"
import { createCubeAnimationSystem, initializeCamera, initializeCubes } from './cubeAnimationSystem';
import { cubeVertexArray } from './cube';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const canvas = document.getElementById('canvas') as HTMLCanvasElement

initWebGPUSession().then((session) => {
  const engine = new Engine(canvas, session)
  const world = createWorld()
  const scene = engine.createScene(world)

  const cubeAnimationSystem = createCubeAnimationSystem(scene)
  const renderSystem = createRenderSystem(scene)

  const pipeline = pipe(cubeAnimationSystem, renderSystem)

  initializeCubes(world)
  initializeCamera(world, scene)
  scene.meshStore.addMesh({
    vertices: cubeVertexArray
  })

  setInterval(() => {
    pipeline(world)
  }, 16)
})

root.render(
  <StrictMode>
    <div>Placeholder</div>
  </StrictMode>
);
