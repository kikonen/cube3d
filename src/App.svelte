<script>
  import {onMount} from 'svelte';
  import {afterUpdate} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import Vec3D from './Vec3D.js';
  import Input from './Input.js';
  import Engine from './Engine.js';

  export let name;

  let canvasEl;

  let models = [
    {
      name: 'airboat',
      pos: new Vec3D(0, 0, 12),
    },
    {
      name: 'cow',
      pos: new Vec3D(0, 0, 8),
    },
    {
      name: 'cube',
      pos: new Vec3D(0, 0, 3),
    },
    {
      name: 'pumpkin',
      pos: new Vec3D(0, 0, 2),
    },
    {
      name: 'teapot',
      pos: new Vec3D(0, 0, 5),
    },
    {
      name: 'teddy',
      pos: new Vec3D(0, 0, 30),
    },
  ]

  let currentModel = 'cube';

  let started = false;
  let debug = false;
  let fill = true;
  let wireframe = false;
  let rotate = false;

  let fps = 0;
  let frames = 0;
  let secs = 0;

  let input;
  let engine;

  function start() {
    started = true;
    input = new Input();

    let model = null;
    models.forEach((m) => {
      if (m.name == currentModel) {
        model = m;
      }
    });

    fps = 0;
    engine = new Engine({input, canvasEl});
    engine.rotate = rotate;
    engine.debug = debug;
    engine.fill = fill;
    engine.wireframe = wireframe;

    if (debug) {
      console.log(engine);
    }

    let resource = `../cube3d/model/${model.name}.obj`;
    engine
      .openModel({resource: resource, pos: model.pos})
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
      engine.fill = fill;
      engine.resetFrames();
    }
    if (fill) {
      console.clear();
    }
  }

  function toggleWireframe() {
    wireframe = !wireframe;
    if (engine) {
      engine.wireframe = wireframe;
      engine.resetFrames();
    }
    if (wireframe) {
      console.clear();
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
      engine.rotate = rotate;
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
  <div>
    <button on:click={toggleGame}>{started ? 'Stop' : 'Start'}</button>
    <button on:click={toggleFill}>{fill ? 'Fill: On' : 'Fill: Off'}</button>
    <button on:click={toggleWireframe}>{wireframe ? 'Wireframe: On' : 'Wireframe: Off'}</button>
    <button on:click={toggleRotate}>{rotate ? 'Rotate: On' : 'Rotate: Off'}</button>
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

  <container class="container">
    <canvas bind:this={canvasEl} class="canvas" width=400 height=400></canvas>
  </container>
  <div>
    {fps} fps <!-- ({frames} frames {secs} secs) -->
  </div>
</main>

<style>
  main {
    box-sizing: border-box;

    text-align: center;
    margin: 0;
  }

  .container {
    box-sizing: border-box;
    padding: 0;
    margin: 0;

    background-color: red;
    width: 400px;
    height: 400px;
  }

  .canvas {
    background-color: black;

    width: 400px;
    height: 400px;
  }
</style>
