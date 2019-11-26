<script>
  import ResultGrid from './ResultGrid.svelte';

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

  let mutationsCount;

  const unsubscribe = count.subscribe(value => {
    mutationsCount = value;
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
      with ${mutationsCount} times of mutation. 
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
</script>

<style>
  .startButton {
    border: 0;
    padding: 8px 20px;
    background: #ddd;
    font-size: 14px;
  }
</style>

<div class="calculateBlock">
  <ResultGrid {running} {graph} currentGeneration={iterators.currentGeneration} {mutationsCount} {bestValue} {currentBest} {population} {best} />

  <button class="startButton" on:click={onStartOrStop}>Start/Stop</button>
</div>
