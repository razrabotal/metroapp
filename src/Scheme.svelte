<script>
  import PathCalculate from "./pathCalculate/PathCalculate.svelte";
  import SchemeRender from "./SchemeRender.svelte";
  import { onMount } from "svelte";

  import createGraph from "./graphBuilder";

  let graph;
  let stationsBetween;
  let dis;
  let bestPath;

  onMount(async () => {
    const res = await fetch(`https://metro.kh.ua/metroapi.php?value=path`);
    const data = await res.json();
    const graphData = createGraph(data)
    graph = graphData.graph;
    stationsBetween = graphData.stationsBetween;
    dis = graphData.distances;
  });

  function getResult(e) {
    bestPath = e.detail.result;
  }
</script>

<div class="lol">
  {#if graph && stationsBetween && dis}
    <PathCalculate {graph} {stationsBetween} {dis} on:getResult={getResult}/>
  {/if}

  <SchemeRender path={bestPath} {stationsBetween}/>
</div>
