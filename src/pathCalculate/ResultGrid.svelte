<script>
  import StopWatch from "../stopWatch/StopWatch.svelte";

  export let running;
  export let graph;
  export let currentGeneration;
  export let mutationsCount;
  export let bestValue;
  export let currentBest;
  export let population;
  export let best;

  $: bestPopulation =
    population[currentBest.bestPosition] &&
    population[currentBest.bestPosition].toString();
</script>

<style>
  .info {
    font-family: "Courier New", Courier, monospace;
    display: flex;
    background: #ddd;
  }
  .table {
    background: #eee;
    max-width: 300px;
    padding: 10px;
  }
  .stopWatch {
    display: flex;
    justify-content: center;
  }
  .paths {
    padding: 10px;
  }
  .row {
    display: flex;
  }
  .value {
    margin-left: auto;
  }

  p { 
      font-size: 11px;
  }
</style>

<div class="info">
  <div class="table">
    <div class="stopWatch">
      <StopWatch {running} />
    </div>
    <div class="row">
      <div class="label">Stations:</div>
      <div class="value">{graph.nodes().length}</div>
    </div>
    <div class="row">
      <div class="label">Generation:</div>
      <div class="value">{currentGeneration}</div>
    </div>
    <div class="row">
      <div class="label">Mutations:</div>
      <div class="value">{mutationsCount}</div>
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
      <div class="value-row">
        <p>{best.toString()}</p>
      </div>
    </div>

    <div>
      <div class="label-row">Best path in current population:</div>
      <div class="value-row">
        <p>{bestPopulation}</p>
      </div>
    </div>

    <div>
      <div class="label-row">Population:</div>
      <div class="value-row">
        {#each population as item}
          <p>{item.toString()}</p>
        {/each}
      </div>
    </div>
  </div>
</div>
