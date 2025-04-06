import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createWorld, Engine, createRenderSystem, pipe, initWebGPUSession } from "@chow/chow-engine"
import { createCubeAnimationSystem, initializeCubes } from './cubeAnimationSystem';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const canvas = document.getElementById('canvas') as HTMLCanvasElement

initWebGPUSession().then((session) => {
  const engine = new Engine(canvas, session)
  const scene = engine.createScene()

  const cubeAnimationSystem = createCubeAnimationSystem(scene)
  const renderSystem = createRenderSystem(scene)

  const pipeline = pipe(cubeAnimationSystem, renderSystem)

  const world = createWorld()

  initializeCubes(world)

  // TODO: initialize cube mesh

  setInterval(() => {
    pipeline(world)
  }, 16)
})

root.render(
  <StrictMode>
    <div>Placeholder</div>
  </StrictMode>
);
