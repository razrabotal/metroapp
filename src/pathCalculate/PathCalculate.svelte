<script>
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { onDestroy } from "svelte";
  import ResultGrid from "./ResultGrid.svelte";
  import MatrixRender from "./MatrixRender.svelte";
  import { mutationCount, crossoverCount } from "./store.js";
  import { createEventDispatcher } from "svelte";
  import { randomNumber } from "../helpers/randomNumber";
  import { evaluate, randomIndivial, getCurrentBest } from "./helper";
  import { selection, mutation, crossover } from "./algorithm";

  const dispatch = createEventDispatcher();

  // constants
  let populationSize = 20;
  let crossoverProbability = 0.9;
  let intervalDuration = 80;

  let mutationProps = {
    mutationProbability: 0.1,
    doMutateProbability: 0.1,
    pushMutateProbability: 0.1,
    reverseMutateProbability: 0.1
  };

  export let id;
  export let graph, stationsBetween, dis;
  export let metroImage;

  let running = false;
  let bestResultsFromStorage = [];
  let mainInterval;

  let currentGeneration = 0;
  let bestValue = 0;
  let bestValuesArray = [];
  let best = [];
  let currentBest = {
    bestPosition: 0,
    bestValue: []
  };
  let population = [];
  let values = [];
  let mutationsCount;
  let crossoversCount;

  const unsubscribeMutation = mutationCount.subscribe(
    value => (mutationsCount = value)
  );
  const unsubscribeCrossover = crossoverCount.subscribe(
    value => (crossoversCount = value)
  );

  onDestroy(() => {
    clearInterval(mainInterval);
  });

  onMount(() => {
    bestResultsFromStorage = JSON.parse(localStorage.getItem(id)) || [];
  });

  function onSave() {
    bestResultsFromStorage = [
      ...bestResultsFromStorage,
      { bestValue, bestPath: best }
    ];
    localStorage.setItem(id, JSON.stringify(bestResultsFromStorage));
  }

  function onClear() {
    localStorage.setItem(id, JSON.stringify("[]"));
    bestResultsFromStorage = [];
  }

  function onStart() {
    if (!running) {
      GAStart();
      running = true;
    }
  }

  function onStop() {
    if (running) {
      GAStop();
      running = false;
    }
  }

  function dispatchBestResult() {
    dispatch("getResult", {
      result: best
    });
  }

  function GAStop() {
    clearInterval(mainInterval);
    dispatchBestResult();
  }

  function GAStart() {
    initData();
    GAInitialize();
    mainInterval = setInterval(render, intervalDuration);
  }

  function initData() {
    currentGeneration = 0;
    bestValue = undefined;
    best = [];
    bestValuesArray = [];
    currentBest = 0;
    population = [];
    values = new Array(populationSize);
    mutationCount.update(n => 0);
    crossoverCount.update(n => 0);
  }

  function render() {
    GANextGeneration();
  }

  function GAInitialize() {
    const stationsCount = graph.nodes().length;
    population = Array.apply(null, Array(populationSize)).map(item =>
      randomIndivial(stationsCount)
    );
    setBestValue();
  }

  function GANextGeneration() {
    currentGeneration++;
    population = selection(
      population,
      currentBest,
      best,
      values,
      populationSize
    );
    population = crossover(
      population,
      dis,
      populationSize,
      crossoverProbability
    );
    population = mutation(population, populationSize, mutationProps);
    setBestValue();
  }

  function setBestValue() {
    values = population.map(item => evaluate(item, dis));
    currentBest = getCurrentBest(values);

    if (bestValue === undefined || bestValue > currentBest.bestValue) {
      best = population[currentBest.bestPosition].clone();
      bestValue = currentBest.bestValue;
      bestValuesArray = [...bestValuesArray, bestValue];
    }
  }
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  .calculate-block-wrapper {
    margin-bottom: 30px;
  }

  .calculate-block {
    @include section;
    margin-bottom: 40px;

    display: flex;
    flex-direction: column; 

    &__content {
      display: flex;
      flex-wrap: wrap;
    }
  }

  .constants {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 250px;
    // border-right: 1px solid #ddd;
    padding: 20px;
    background: $background-color--base;
    border-radius: var(--radius) 0 0 var(--radius);

    h4 {
      margin-bottom: 20px;
    }
  }
  label {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 12px;
    margin-bottom: 8px;

    @include sm {
      flex-direction: column;
    }

    span {
      margin-bottom: 5px;
      min-width: 140px;
    }
  }
  .text-input {
    @include text-input;
    width: 70px;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    margin-top: 40px;
  }
  .startButton {
    @include button;
    margin-bottom: 20px;
  }

  .flex {
    display: flex;
    margin-bottom: 10px;
    flex-direction: column;

    @include sm {
      flex-direction: row;

      & > *:not(:last-child) {
        margin-right: 12px;
      }
    }
  }

  .storage-buttons {
    margin-top: auto;
    padding-top: 30px;
  }
</style>

<MatrixRender {graph} {metroImage} />

<div class="calculate-block-wrapper" in:fly={{ y: 50, duration: 1000 }}>

  <div class="calculate-block">

    <div class="calculate-block__content">

      <div class="constants">
        <h4>Algorithm parameters</h4>

        <div class="flex">
          <label>
            <span>Population size:</span>
            <input
              class="text-input"
              bind:value={populationSize}
              type="number"
              step="1"
              min="1"
              max="50" />
          </label>

          <label>
            <span>Interval duration:</span>
            <input
              disabled={running}
              class="text-input"
              bind:value={intervalDuration}
              type="number"
              step="20"
              min="10"
              max="3000" />
          </label>
        </div>

        <div class="flex">
          <label>
            <span>Crossover probability:</span>
            <input
              class="text-input"
              bind:value={crossoverProbability}
              type="number"
              step="0.1"
              min="0.01"
              max="1" />
          </label>
        </div>

        <label>
          <span>Mutation probability:</span>
          <input
            class="text-input"
            bind:value={mutationProps.mutationProbability}
            type="number"
            step="0.01"
            min="0.01"
            max="1" />
        </label>
        <label>
          <span>'Do' mutation:</span>
          <input
            class="text-input"
            bind:value={mutationProps.doMutateProbability}
            type="number"
            step="0.01"
            min="0.01"
            max="1" />
        </label>
        <label>
          <span>'Push' mutation:</span>
          <input
            class="text-input"
            bind:value={mutationProps.pushMutateProbability}
            type="number"
            step="0.01"
            min="0.01"
            max="1" />
        </label>
        <label>
          <span>'Reverse' mutation:</span>
          <input
            class="text-input"
            bind:value={mutationProps.reverseMutateProbability}
            type="number"
            step="0.01"
            min="0.01"
            max="1" />
        </label>

        <div class="buttons">
          <button class="startButton protrude" on:click={onStart}>Start</button>
          <button class="startButton protrude" on:click={onStop}>Stop</button>
        </div>

        {#if !running && bestValue}
          <div class="storage-buttons">
            <button class="startButton protrude" on:click={onSave}>
              Save to storage
            </button>

            {#if bestResultsFromStorage.length}
              <button class="startButton protrude" on:click={onClear}>
                Clear storage
              </button>
            {/if}
          </div>
        {/if}
      </div>

      <ResultGrid
        {running}
        {graph}
        {currentGeneration}
        {mutationsCount}
        {crossoversCount}
        {bestValue}
        {currentBest}
        {population}
        {best}
        {bestValuesArray}
        {bestResultsFromStorage} />
    </div>

  </div>
</div>
