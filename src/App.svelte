<script>
  import {onMount} from 'svelte';
  import {afterUpdate} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import Vec3D from './Vec3D.js';
  import Material from './Material.js';
  import Input from './Input.js';
  import Camera from './Camera.js';
  import Engine from './Engine.js';

  export let name;

  let canvasEl;

  let models = [
    {
      name: 'airboat',
      pos: new Vec3D(0, 0, 12),
      scale: 1,
    },
    {
      name: 'axis',
      pos: new Vec3D(0, 0, 20),
      scale: 1,
    },
    {
      name: 'cow',
      pos: new Vec3D(0, 0, 8),
      scale: 1,
    },
    {
      name: 'cube',
      pos: new Vec3D(0, 0, 3),
      scale: 1,
    },
    {
      name: 'rubik_cube',
      pos: new Vec3D(0, 0, 3),
      scale: 1,
    },
    {
      name: 'texture_cube',
      pos: new Vec3D(0, 0, 3),
      scale: 1,
    },
    {
      name: 'pumpkin',
      pos: new Vec3D(0, 0, 75),
      scale: 1,
    },
    {
      name: 'teapot',
      pos: new Vec3D(0, 0, 5),
      scale: 1,
    },
    {
      name: 'teddy',
      pos: new Vec3D(0, 0, 30),
      scale: 1,
    },
    {
      name: 'mountains',
      pos: new Vec3D(0, 0, 30),
      camera: new Camera(new Vec3D(0, 20, 40), new Vec3D(0, 0, 1)),
      scale: 1,
    },
  ]

  let cameraModel = {
    cameraMesh: true,
    name: 'axis',
    pos: new Vec3D(0, -1, 5),
    material: new Material("cam", [100, 100, 100]),
    scale: 0.4,
  };

  let nameToModel = {};
  models.forEach((model) => {
    nameToModel[model.name] = model;
  });

  let currentModel = 'axis';

  let started = false;
  let debug = false;
  let fill = true;
  let wireframe = false;
  let texture = true;
  let rotate = false;
  let optimize = false;

  let fps = 0;
  let frames = 0;
  let secs = 0;

  let camera = null;

  let input;
  let engine;

  function start() {
    started = true;

    let model = nameToModel[currentModel];
    let activeModels = [
      model,
      cameraModel,
    ];

    input = new Input();

    fps = 0;
    engine = new Engine({input: input, canvas: canvasEl});
    engine.debug = debug;
    engine.useRotate = rotate;
    engine.useFill = fill;
    engine.useWireframe = wireframe;
    engine.useTexture = texture;
    engine.useOptimize = optimize;

    if (model.camera) {
      engine.camera = model.camera;
    }

    camera = engine.camera;

    if (debug) {
      console.log(engine);
    }

    engine
      .loadModels({models: activeModels})
      .then(() => {
        engine.start();
        countFps();
      }).catch((e) => {
        console.error(e);
      });
  }

  function stop() {
    if (debug) {
      console.log(engine);
    }
    engine.stop();
    started = false;
  }

  function countFps() {
    if (!started) {
      return;
    }
    if (!engine.started) {
      return;
    }

    camera = engine.camera;
    secs = (new Date().getTime() - engine.startTime.getTime()) / 1000;
    frames = engine.frames;
    if (secs > 0) {
      fps = Math.round(frames / secs, 2);
    }

    setTimeout(countFps, 100);
  }

  function toggleGame() {
    if (started) {
      stop();
    } else {
      start();
    }
  }

  function toggleFill() {
    fill = !fill;
    if (engine) {
      engine.useFill = fill;
      engine.resetFrames();
    }
  }

  function toggleWireframe() {
    wireframe = !wireframe;
    if (engine) {
      engine.useWireframe = wireframe;
      engine.resetFrames();
    }
  }

  function toggleTexture() {
    texture = !texture;
    if (engine) {
      engine.useTexture = texture;
      engine.resetFrames();
    }
  }

  function toggleDebug() {
    debug = !debug;
    if (engine) {
      engine.debug = debug;
      engine.resetFrames();
    }
    if (debug) {
      console.clear();
    }
  }

  function toggleRotate() {
    rotate = !rotate;
    if (engine) {
      engine.useRotate = rotate;
      engine.resetFrames();
    }
  }

  function toggleOptimize() {
    optimize = !optimize;
    if (engine) {
      engine.useOptimize = optimize;
      engine.resetFrames();
    }
  }

  function onChangeModel() {
    if (started) {
      stop();
      start();
    }
  }

  onMount(function () {
  });

  function handleKeydown(ev) {
    if (input) {
      input.handleKeydown(ev);
    }
  }

  function handleKeyup(ev) {
    if (input) {
      input.handleKeyup(ev);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}
               on:keyup={handleKeyup}
/>

<main>
  <h1>3D</h1>
  <div class="buttons">
    <button on:click={toggleGame}>{started ? 'Stop' : 'Start'}</button>
    <button on:click={toggleFill}>{fill ? 'Fill: On' : 'Fill: Off'}</button>
    <button on:click={toggleWireframe}>{wireframe ? 'Wireframe: On' : 'Wireframe: Off'}</button>
    <button on:click={toggleTexture}>{texture ? 'Texture: On' : 'Texture: Off'}</button>
    <button on:click={toggleRotate}>{rotate ? 'Rotate: On' : 'Rotate: Off'}</button>
    <button on:click={toggleOptimize}>{optimize ? 'Optimize: On' : 'Optimize: Off'}</button>
    <button on:click={toggleDebug}>{debug ? 'Debug: On' : 'Debug: Off'}</button>

    <span>
      <label for="select_model">Model:</label>
      <select id="select_model" bind:value={currentModel} on:change={onChangeModel}>
        {#each models as model}
          <option selected={currentModel === model.name || undefined}>{model.name}</option>
        {/each}
      </select>
    </span>
  </div>

  <div class="container">
    <canvas bind:this={canvasEl} class="canvas" width=400 height=400></canvas>

    <div class="info">
      <div>
        {fps} fps <!-- ({frames} frames {secs} secs) -->
      </div>
      {#if camera}
        <div>
          Camera position: ({camera.pos.x.toFixed(1)}, {camera.pos.y.toFixed(1)}, {camera.pos.z.toFixed(1)})
          <br>
          Camera dir: ({camera.dir.x.toFixed(1)}, {camera.dir.y.toFixed(1)}, {camera.dir.z.toFixed(1)})
          {#if camera.angleX}
            <br>
            Camera angle: ({camera.angleX.toFixed(1)}, {camera.angleY.toFixed(1)}, {camera.angleZ.toFixed(1)})
          {/if}
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  main {
    box-sizing: border-box;
    text-align: center;
    margin: 0;
  }

  .buttons {
  }

  .container {
    box-sizing: border-box;
    padding: 0;
    margin: auto;

    background-color: red;
    width: 600px;
    height: 400px;
  }

  .canvas {
    background-color: black;

    width: 600px;
    height: 400px;

    border: 1px solid;
  }

  .info {
    text-align: left;
  }
</style>
