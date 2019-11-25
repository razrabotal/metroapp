<script>
  import { onMount } from "svelte";

  import SchemeRender from "./SchemeRender.svelte";
  import { randomNumber } from "./Untils";
  import {
    countDistances,
    evaluate,
    randomIndivial,
    wheelOut,
    createRoulette,
    getCurrentBest
  } from "./Algorithm";
  import { pushMutateMath, doMutateMath, reverseMutateMath } from "./Mutations";
  import createGraph from "./graphBuilder";



  $: text = "";

  let graph;
  let stationsBetween;

  const POPULATION_SIZE = 30;
  const CROSSOVER_PROBABILITY = 0.9;
  const MUTATION_PROBABILITY = 0.01;

  let running = false;
  let mainInterval;
  const INTERVAL_DURATION = 40;

  let iterators;
  let dis;
  let bestValue;
  let best;
  let currentBest;
  let population;
  let values;

  onMount(async () => {
    const res = await fetch(`https://metro.kh.ua/metroapi.php?value=path`);
    const data = await res.json();
    const graphData = createGraph(data)
    graph = graphData.graph;
    stationsBetween = graphData.stationsBetween;
    dis = countDistances(graph);
  });

  function startOrStop() {
    if (running) {
      clearInterval(mainInterval);
      return (running = false);
    }
    initData();
    GAInitialize();
    mainInterval = setInterval(draw, INTERVAL_DURATION);
    return (running = true);
  }

  function initData() {
    iterators = {
      mutationTimes: 0,
      currentGeneration: 0
    };
    bestValue = undefined;
    best = [];
    currentBest = 0;
    population = [];
    values = new Array(POPULATION_SIZE);
  }

  function draw() {
    GANextGeneration();

    text = `<p>
      There are ${graph.nodes().length} stations in the map. 
      The ${iterators.currentGeneration}th generation 
      with ${iterators.mutationTimes} times of mutation. 
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
    selection();
    crossover();
    mutation();
    setBestValue();
  }

  function selection() {
    let parents = new Array();
    let initnum = 5;
    parents.push(population[currentBest.bestPosition]);
    parents.push(doMutate(best.clone()));
    parents.push(pushMutate(best.clone()));
    parents.push(reverseMutate(best.clone()));
    parents.push(best.clone());

    const roulette = createRoulette(values);

    for (let i = initnum; i < POPULATION_SIZE; i++) {
      parents.push(population[wheelOut(roulette)]);
    }
    population = parents;
  }

  function crossover() {
    let queue = new Array();
    for (let i = 0; i < POPULATION_SIZE; i++) {
      if (Math.random() < CROSSOVER_PROBABILITY) {
        queue.push(i);
      }
    }
    queue.shuffle();
    for (let i = 0, j = queue.length - 1; i < j; i += 2) {
      doCrossover(queue[i], queue[i + 1]);
    }
  }

  function doCrossover(x, y) {
    let child1 = getChild("next", x, y);
    let child2 = getChild("previous", x, y);
    population[x] = child1;
    population[y] = child2;
  }

  function getChild(fun, x, y) {
    let solution = new Array();
    let px = population[x].clone();
    let py = population[y].clone();
    let dx, dy;
    let c = px[randomNumber(px.length)];
    solution.push(c);
    while (px.length > 1) {
      dx = px[fun](px.indexOf(c));
      dy = py[fun](py.indexOf(c));
      px.deleteByValue(c);
      py.deleteByValue(c);
      c = dis[c][dx] < dis[c][dy] ? dx : dy;
      solution.push(c);
    }
    return solution;
  }

  function mutation() {
    for (let i = 0; i < POPULATION_SIZE; i++) {
      if (Math.random() < MUTATION_PROBABILITY) {
        if (Math.random() > 0.5) {
          population[i] = doMutateMath(population[i]);
        } else {
          population[i] = pushMutate(population[i]);
        }
        i--;
      }
    }
  }

  function mutationIteration(array) {
    iterators.mutationTimes++;
    return array;
  }
  const reverseMutate = seq => mutationIteration(reverseMutateMath(seq));
  const doMutate = seq => mutationIteration(doMutateMath(seq));
  const pushMutate = seq => mutationIteration(pushMutateMath(seq));

  function setBestValue() {
    values = population.map(item => evaluate(item, dis));
    currentBest = getCurrentBest(values);

    if (bestValue === undefined || bestValue > currentBest.bestValue) {
      reWriteBestValues(population, currentBest);
    }
  }

  function reWriteBestValues(population, currentBest) {
    best = population[currentBest.bestPosition].clone();
    bestValue = currentBest.bestValue;
  }
</script>

<div class="lol">
  <button on:click={startOrStop}>Start/Stop</button>

  <div>
    {@html text}
  </div>

  <SchemeRender path={best} {stationsBetween}/>
</div>
