import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createWorld, Engine, createRenderSystem, pipe, addComponent, addEntity, ModelComponent, TransformComponent } from "@chow/chow-engine"

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const engine = new Engine()
const scene = engine.createScene()

const renderSystem = createRenderSystem(scene)

const pipeline = pipe(renderSystem)

const world = createWorld()

const eid = addEntity(world)
addComponent(world, ModelComponent, eid)
addComponent(world, TransformComponent, eid)

TransformComponent.position.x[eid] = 0
TransformComponent.position.y[eid] = 1
TransformComponent.position.z[eid] = 2
ModelComponent.materials[eid][0] = 0
ModelComponent.mesh[eid] = 0

setInterval(() => {
  pipeline(world)
}, 16)


root.render(
  <StrictMode>
    <div>Placeholder</div>
  </StrictMode>
);
