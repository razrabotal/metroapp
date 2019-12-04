<script>
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import { createEventDispatcher } from "svelte";

  import { fly } from "svelte/transition";

  import ResultGrid from "./ResultGrid.svelte";
  import LabelItem from "./_LabelItem.svelte";
  import MatrixRender from "./MatrixRender.svelte";

  import { mutationCount, crossoverCount } from "./store.js";
  import { randomNumber } from "../helpers/randomNumber";
  import { evaluate, randomIndivial, getCurrentBest } from "./helper";
  import { selection, mutation, crossover } from "./algorithm";

  const dispatch = createEventDispatcher();

  // constants
  let populationSize = 20;
  let crossoverProbability = 0.5;
  let intervalDuration = 20;
  let mutationProps = {
    mutationProbability: 0.1,
    doMutateProbability: 0.1,
    pushMutateProbability: 0.1,
    reverseMutateProbability: 0.05
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

  .calculate-block {
    @include section;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 40px;

    &__left {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 250px;
      padding: 20px;
      background: $background-color--base;
      border-radius: var(--radius) 0 0 var(--radius);

      h4 {
        margin-bottom: 20px;
      }
    }
  }

  .buttons {
    display: flex;
    flex-direction: column;
    margin-top: 40px;
  }
  .startButton {
    @include button;
    margin-bottom: 10px;
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

<div class="calculate-block" in:fly={{ y: 50, duration: 1000 }}>

  <div class="calculate-block__left">
    <h4>Algorithm parameters</h4>

    <div class="flex">
      <LabelItem step="1" min="1" max="50" bind:value={populationSize}>
        Population size:
      </LabelItem>

      <LabelItem
        step="20"
        min="10"
        max="3000"
        disabled={running}
        bind:value={intervalDuration}>
        Interval duration:
      </LabelItem>
    </div>

    <div class="flex">
      <LabelItem
        step="0.1"
        min="0.01"
        max="1"
        bind:value={crossoverProbability}>
        Crossovers probability:
      </LabelItem>
    </div>

    <LabelItem
      step="0.01"
      min="0.01"
      max="1"
      bind:value={mutationProps.mutationProbability}>
      Mutation probability:
    </LabelItem>

    <LabelItem
      step="0.01"
      min="0.01"
      max="1"
      bind:value={mutationProps.doMutateProbability}>
      'Do' mutation:
    </LabelItem>

    <LabelItem
      step="0.01"
      min="0.01"
      max="1"
      bind:value={mutationProps.pushMutateProbability}>
      'Push' mutation:
    </LabelItem>

    <LabelItem
      step="0.01"
      min="0.01"
      max="1"
      bind:value={mutationProps.reverseMutateProbability}>
      'Reverse' mutation:
    </LabelItem>

    <div class="buttons">
      <button class="startButton general" on:click={onStart}>Start</button>
      <button class="startButton" on:click={onStop}>Stop</button>
    </div>

    {#if !running && bestValue}
      <div class="storage-buttons">
        <button class="startButton" on:click={onSave}>Save to storage</button>

        {#if bestResultsFromStorage.length}
          <button class="startButton" on:click={onClear}>Clear storage</button>
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
