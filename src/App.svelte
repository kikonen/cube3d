<script>
  import {onMount} from 'svelte';
  import {afterUpdate} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import Input from './Input.js';
  import Engine from './Engine.js';

  let canvasEl;

  let input;
  let engine;

  function start() {
    let model = '../model/cube.obj';

    input = new Input();
    engine = new Engine({input, canvasEl});

    engine
      .openModel(model)
      .then(() => { engine.start(); });
  }

  onMount(function () {
    start();
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
