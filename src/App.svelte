<script>
  import {onMount} from 'svelte';
  import {afterUpdate} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import Input from './Input.js';
  import Engine from './Engine.js';

  export let name;

  let canvasEl;

  let started = false;
  let debug = false;
  let rotate = false;

  let input;
  let engine;

  function start() {
    started = true;
    input = new Input();

    engine = new Engine({input, canvasEl});
    engine.rotate = rotate;
    engine.debug = debug;

    console.log(engine);

    let model = '../model/cube.obj';
    engine
      .openModel(model)
      .then(() => { engine.start(); });
  }

  function stop() {
    console.log(engine);
    engine.stop();
    started = false;
  }

  function toggleGame() {
    if (started) {
      stop();
    } else {
      start();
    }
  }

  function toggleDebug() {
    debug = !debug;
    if (engine) {
      engine.debug = debug;
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
    <button on:click={toggleDebug}>{debug ? 'Debug off' : 'Debug on'}</button>
    <button on:click={toggleRotate}>{rotate ? 'Rotate off' : 'Rotate on'}</button>
  </div>

  <container class="container">
    <canvas bind:this={canvasEl} class="canvas" width=400 height=400></canvas>
  </container>
</main>

<style>
  main {
    box-sizing: border-box;

    text-align: center;
    padding: 0.5rem;
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
