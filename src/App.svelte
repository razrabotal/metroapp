<script>
  import { onMount } from 'svelte';
  import PathCalculate from "./pathCalculate/PathCalculate.svelte";
  import SchemeRender from "./SchemeRender.svelte";
  import GraphSwitcher from "./GraphSwitcher/GraphSwitcher.svelte";
  import UserMetroGraph from "./GraphSwitcher/UserMetroGraph.svelte";
  import createGraph from "./graphBuilder";
  
  let selectedMetro;
  let cache = {};

  let bestPath;
  let graph;
  let stationsBetween;
  let dis;

  let stations;

  function onSelectMetro(e) {
    selectedMetro = e.detail.result;
    setGraph();
    setStations();
  }

  function getResult(e) {
    bestPath = e.detail.result;
  }

  function onGetUserGraph(e) {
    let userGraph = e.detail.result;
    const graphData = createGraph(userGraph);
    debugger;
  }

  async function getGraph() {
    const res = await fetch(`https://metro.kh.ua/metroapi.php?value=path`);
    const data = await res.json();
    return createGraph(data);
  }
  async function getStations() {
    const res = await fetch(`https://metro.kh.ua/metroapi.php?value=stations`);
    const data = await res.json();
    return data;
  };
  async function setGraph() {
    const graphData = await getData('graphData', getGraph);
    graph = graphData.graph;
    stationsBetween = graphData.stationsBetween;
    dis = graphData.distances;
  }
  async function setStations() {
    const stationsData = await getData('stations', getStations);
    stations = stationsData;
  }

  onMount(async () => {
    selectedMetro = 1;
		setGraph();
		setStations();
  });
  
  async function getData(variable, func) {
    if (cache[variable]) {
      return cache[variable];
    }
    const result = await func();
    cache[variable] = result;
    return result;
  }
</script>

<style global lang="scss">
  @import "src/styles/index.scss"; 

  main { 
    display: block;
    @include centered;
    margin-bottom: 40px;
  }

  header {
    @include centered;
    display: block;
    margin-top: 20px;
    margin-bottom: 40px;
  }
</style>

<header>
  <h1>Transit challenge solver</h1>
  <p>For Kharkiv metropoliten</p>
</header>

<main>
  <GraphSwitcher on:onSelectMetro={onSelectMetro} {selectedMetro}/>

  {#if selectedMetro === 2}
    <UserMetroGraph on:onSubmitGraph={onGetUserGraph}/>
  {/if}

  {#if graph && stationsBetween && dis}
    <PathCalculate {graph} {stationsBetween} {dis} on:getResult={getResult}/>
  {/if}

  {#if bestPath}
    <SchemeRender path={bestPath} {stationsBetween} {stations}/>
  {/if}
</main>