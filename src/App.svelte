<script>
  import PathCalculate from "./pathCalculate/PathCalculate.svelte";
  import SchemeRender from "./SchemeRender.svelte";
  import GraphSwitcher from "./GraphSwitcher/GraphSwitcher.svelte";
  import UserMetroGraph from "./GraphSwitcher/UserMetroGraph.svelte";
  import { getGraph, getStations, getData } from "./graphSwitcher/getData";

  let graphUrl, stationsUrl, selectedMetro;
  let bestPath, stations, graph, stationsBetween, dis;
  let isCalculateShowed = false;
  let isCustomShowed = false;

  function onSelectMetro(e) {
    selectedMetro = e.detail.result;
    graphUrl = e.detail.graphUrl;
    stationsUrl = e.detail.stationsUrl;

    resetData();

    if(!graphUrl && !stationsUrl) {
      return isCustomShowed = true;
    }
    setData();
    return isCustomShowed = false;
  }

  function getResult(e) {
    bestPath = e.detail.result;
  }

  function resetData() {
    bestPath = null;
    stations = null;
    isCalculateShowed = false;
  }

  async function onGetUserGraph(e) {
    graphUrl = e.detail.graphUrl;
    stationsUrl = e.detail.stationsUrl;
    setData();
  }
  async function setGraph(url) {
    const graphData = await getData(`${selectedMetro}-graphData`, () => getGraph(url));
    graph = graphData.graph;
    stationsBetween = graphData.stationsBetween;
    dis = graphData.distances;
  }
  async function setStations(url) {
    const stationsData = await getData(`${selectedMetro}-stations`, () => getStations(url));
    stations = stationsData;
  }
  async function setData() {
    if(graphUrl) await setGraph(graphUrl);
    isCalculateShowed = true;
    
    if(stationsUrl) await setStations(stationsUrl);
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
  <GraphSwitcher on:onSelectMetro={onSelectMetro} {selectedMetro} />

  {#if isCustomShowed}
    <UserMetroGraph on:onSubmitGraph={onGetUserGraph} />
  {/if}

  {#if graph && stationsBetween && dis && isCalculateShowed}
    <PathCalculate {graph} {stationsBetween} {dis} on:getResult={getResult} />
  {/if}

  {#if stations && bestPath}
    <SchemeRender path={bestPath} {stationsBetween} {stations} />
  {/if}
</main>
