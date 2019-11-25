<script>
  import StopWatch from "../stopWatch/StopWatch.svelte";

  import { createEventDispatcher } from "svelte";
  import { count } from "./store.js";
  const dispatch = createEventDispatcher();

  import { randomNumber } from "../helpers/randomNumber";
  import { evaluate, randomIndivial, getCurrentBest } from "./helper";
  import { selection, mutation, crossover } from "./algorithm";
  import { POPULATION_SIZE, INTERVAL_DURATION } from "./constants";

  export let graph;
  export let stationsBetween;
  export let dis;

  $: text = "";

  let running = false;
  let mainInterval;

  let iterators = {};
  let bestValue;
  let best = [];
  let currentBest = {};
  let population = [];
  let values;

  let count_value;

  const unsubscribe = count.subscribe(value => {
    count_value = value;
  });

  function onStartOrStop() {
    if (running) {
      clearInterval(mainInterval);
      dispatch("getResult", {
        result: best
      });
      return (running = false);
    }
    initData();
    GAInitialize();
    mainInterval = setInterval(render, INTERVAL_DURATION);
    return (running = true);
  }

  function initData() {
    iterators = {
      currentGeneration: 0
    };
    bestValue = undefined;
    best = [];
    currentBest = 0;
    population = [];
    values = new Array(POPULATION_SIZE);
  }

  function render() {
    GANextGeneration();

    text = `<p>
      There are ${graph.nodes().length} stations in the map. 
      The ${iterators.currentGeneration}th generation 
      with ${count_value} times of mutation. 
      Best value: ${~~bestValue} -- ${currentBest.bestValue}. 
      Path: ${best.toString()}</p>`;
  }

  function GAInitialize() {
    const stationsCount = graph.nodes().length;
    population = Array.apply(null, Array(POPULATION_SIZE)).map(item =>
      randomIndivial(stationsCount)
    );
    setBestValue();
  }
  function GANextGeneration() {
    iterators.currentGeneration++;
    population = selection(population, currentBest, best, values);
    population = crossover(population, dis);
    population = mutation(population);
    setBestValue();
  }

  function setBestValue() {
    values = population.map(item => evaluate(item, dis));
    currentBest = getCurrentBest(values);

    if (bestValue === undefined || bestValue > currentBest.bestValue) {
      best = population[currentBest.bestPosition].clone();
      bestValue = currentBest.bestValue;
    }
  }

  function toggleStopWatch() {

  }
  function stopStopWatch() {

  }
</script>

<style>
.startButton {
  border: 0;
  padding: 8px 20px;
  background: #ddd;
  font-size: 14px;
}
.info {
  display: flex;
  background: #ddd;
}
  .table {
    background: #eee;
    max-width: 300px;
  }
  .stopWatch {
    display: flex;
    justify-content: center;
  }
  .row {
    display: flex;
  }
  .value {
    margin-left: auto;
  }
</style>

<div class="calculateBlock">
  <button class="startButton" on:click={onStartOrStop}>Start/Stop</button>

  
  <div class="info">
  <div class="table">
    <div class="stopWatch">
        <StopWatch {running}/>
    </div>
    <div class="row">
      <div class="label">Stations:</div>
      <div class="value">{graph.nodes().length}</div>
    </div>
    <div class="row">
      <div class="label">Generation:</div>
      <div class="value">{iterators.currentGeneration}</div>
    </div>
    <div class="row">
      <div class="label">Mutations:</div>
      <div class="value">{count_value}</div>
    </div>
    <div class="row">
      <div class="label">Best value:</div>
      <div class="value">{bestValue}</div>
    </div>
    <div class="row">
      <div class="label">Best in population:</div>
      <div class="value">{currentBest.bestValue}</div>
    </div>
  </div>
  
    <div class="paths">
      <div>
        <div class="label-row">Best path:</div>
        <div class="value-row">{best.toString()}</div>
      </div>

      <div>
        <div class="label-row">Best path in current population:</div>
        <div class="value-row">
          <p>{ population[currentBest.bestPosition] && population[currentBest.bestPosition].toString() }</p>
        </div>
      </div>

      <div>
        <div class="label-row">Population:</div>
        <div class="value-row">
          {#each population as item}
            <p>{ item.toString()}</p>
          {/each}
        </div>
      </div>
    </div>
  </div>


  
</div>
