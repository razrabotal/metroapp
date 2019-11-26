<script>
  import PathCalculate from "./pathCalculate/PathCalculate.svelte";
  import SchemeRender from "./SchemeRender.svelte";
  import GraphSwitcher from "./GraphSwitcher/GraphSwitcher.svelte";
  import createGraph from "./graphBuilder";

  let selectedMetro;

  let bestPath;
  let graph;
  let stationsBetween;
  let dis;

  let stations;

  function onSelectMetro(e) {
    selectedMetro = e.detail.result;
    getGraph();
    getStations();
  }

  function getResult(e) {
    bestPath = e.detail.result;
  }

  async function getGraph() {
    const res = await fetch(`https://metro.kh.ua/metroapi.php?value=path`);
    const data = await res.json();
    const graphData = createGraph(data)
    graph = graphData.graph;
    stationsBetween = graphData.stationsBetween;
    dis = graphData.distances;
  }

  async function getStations() {
    const res = await fetch(`https://metro.kh.ua/metroapi.php?value=stations`);
    const data = await res.json();
    stations = data;
  };
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

  {#if graph && stationsBetween && dis}
    <PathCalculate {graph} {stationsBetween} {dis} on:getResult={getResult}/>
  {/if}

  <SchemeRender path={bestPath} {stationsBetween} {stations}/>
</main>