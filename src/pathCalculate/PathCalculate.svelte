<script>
  import ResultGrid from "./ResultGrid.svelte";
  import { mutationCount, crossoverCount } from "./store.js";
  import { createEventDispatcher } from "svelte";
  import { randomNumber } from "../helpers/randomNumber";
  import { evaluate, randomIndivial, getCurrentBest } from "./helper";
  import { selection, mutation, crossover } from "./algorithm";
  const dispatch = createEventDispatcher();

  // constants
  let populationSize = 20;
  let crossoverProbability = 0.9;
  let mutationProbability = 0.1;
  let intervalDuration = 40;

  export let graph;
  export let stationsBetween;
  export let dis;

  let running = false;
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

  const unsubscribeMutation = mutationCount.subscribe(value => mutationsCount = value );
  const unsubscribeCrossover = crossoverCount.subscribe(value => crossoversCount = value );

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

  function GAStop() {
    clearInterval(mainInterval);
    dispatch("getResult", {
      result: best
    });
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
    population = selection(population, currentBest, best, values, populationSize);
    population = crossover(population, dis, populationSize, crossoverProbability);
    population = mutation(population, populationSize, mutationProbability);
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
    margin-bottom: 30px;
  }

  .result-wrapper {
    @include section;
    padding: 10px;
    margin-bottom: 20px;
  }

  .constants {
    display: flex;
    margin-bottom: 20px;
  }
  label {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    margin-right: 20px;

    span {
      margin-bottom: 5px;
    }
  }
  .text-input {
    @include text-input;
    width: 70px;
  }
  .buttons {
    margin-left: auto;
  }
  .startButton {
    @include button;
    margin-left: 10px;
  }
</style>

<div class="calculate-block">

  <div class="result-wrapper">
    <div class="constants">
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
        <span>Crossover probability:</span>
        <input
          class="text-input"
          bind:value={crossoverProbability}
          type="number"
          step="0.1"
          min="0.01"
          max="1" />
      </label>
      <label>
        <span>Mutation probability:</span>
        <input
          class="text-input"
          bind:value={mutationProbability}
          type="number"
          step="0.01"
          min="0.01"
          max="1" />
      </label>
      <label>
        <span>Interval duration:</span>
        <input
          class="text-input"
          bind:value={intervalDuration}
          type="number"
          step="20"
          min="10"
          max="3000" />
      </label>

      <div class="buttons">
        <button class="startButton protrude" on:click={onStart}>Start</button>
        <button class="startButton protrude" on:click={onStop}>Stop</button>
      </div>
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
      {bestValuesArray} />
  </div>
</div>
