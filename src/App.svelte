<script>
  import PathCalculate from "./pathCalculate/PathCalculate.svelte";
  import ResultRender from "./render/ResultRender.svelte";
  import GraphSwitcher from "./GraphSwitcher/GraphSwitcher.svelte";
  import UserMetroGraph from "./GraphSwitcher/UserMetroGraph.svelte";
  import { getGraph, getStations, getScheme, getData } from "./graphSwitcher/getData";

  let graphUrl, stationsUrl, schemeUrl;
  let selectedMetro, timeOnStation, metroImage;
  let schemeSVGData, bestPath, stations, graph, stationsBetween, dis;
  let isCalculateShowed = false;
  let isCustomShowed = false;

  function onSelectMetro(e) {
    selectedMetro = e.detail.result;
    graphUrl = e.detail.graphUrl;
    stationsUrl = e.detail.stationsUrl;
    schemeUrl = e.detail.schemeUrl;
    timeOnStation = e.detail.timeOnStation;
    metroImage = e.detail.metroImage;

    resetData();

    if (!graphUrl && !stationsUrl) {
      return (isCustomShowed = true);
    }
    setData(); 
    return (isCustomShowed = false);
  }

  function getResult(e) {
    bestPath = e.detail.result;
  }

  function resetData() {
    bestPath = null;
    stations = null;
    schemeSVGData = null;
    isCalculateShowed = false;
  }

  async function onGetUserGraph(e) {
    graphUrl = e.detail.graphUrl;
    stationsUrl = e.detail.stationsUrl;
    setData();
  }

  function getUniqueId(value = '') {
    return `${selectedMetro}-${timeOnStation}-${value}`;
  }

  async function setGraph(url) {
    const graphData = await getData(
      getUniqueId('graphData'),
      () => getGraph(url, timeOnStation)
    );
    graph = graphData.graph;
    stationsBetween = graphData.stationsBetween;
    dis = graphData.distances;
  }
  async function setStations(url) {
    const stationsData = await getData(
      getUniqueId('stations'),
      () => getStations(url)
    );
    stations = stationsData;
  }
  async function setScheme(url) {
    const schemeData = await getData(
      getUniqueId('scheme'),
      () => getScheme(url)
    );
    schemeSVGData = schemeData;
  }
  async function setData() {
    if (graphUrl) await setGraph(graphUrl);
    isCalculateShowed = true;

    if (stationsUrl) await setStations(stationsUrl);
    if (schemeUrl) await setScheme(schemeUrl);
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

  footer {
    @include centered;
    display: block;
    margin-top: 60px;
    margin-bottom: 40px;
    font-size: 12px; 
  }   
</style>  
 
<header>
  <h1>Transit challenge solver</h1>
  <p>For Kharkiv and other metropolitens</p>
</header>

<main>
  <GraphSwitcher on:onSelectMetro={onSelectMetro} />

  {#if isCustomShowed}
    <UserMetroGraph on:onSubmitGraph={onGetUserGraph} />
  {/if}

  {#if graph && stationsBetween && dis && isCalculateShowed}
    <PathCalculate
      {graph}
      {stationsBetween}
      {dis}
      {metroImage}
      id={getUniqueId()}
      on:getResult={getResult} />
  {/if}  

  {#if bestPath}
    <ResultRender path={bestPath} {stationsBetween} {stations} {metroImage} {schemeSVGData}/>
  {/if} 
</main>
 
<footer>
  <p>Taras Gordienko, 2019</p>
</footer>
