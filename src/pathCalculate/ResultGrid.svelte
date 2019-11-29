<script>
  import StopWatch from "../stopWatch/StopWatch.svelte";

  export let running;
  export let graph;
  export let currentGeneration;
  export let mutationsCount;
  export let crossoversCount;
  export let bestValue;
  export let currentBest;
  export let population;
  export let best;
  export let bestValuesArray;

  $: bestPopulation =
    population[currentBest.bestPosition] ?
    population[currentBest.bestPosition].toString() : '';

  $: bestValuesString = bestValuesArray.join(" > ").toString();
</script>

<style lang="scss">
  .info {
    font-family: "Courier New", Courier, monospace;
    display: flex;
  }
  .table {
    max-width: 300px;
    flex: 1;
    padding: 10px;
  }
  .stop-watch {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  .paths {
    padding: 10px 30px;
    flex: 2;
  }
  .paths-row {
      margin-bottom: 10px;
    }
  .row {
    display: flex;
    margin-bottom: 10px;
  }
  .row-result {
    flex-direction: column;

    .label {
      margin-top: 10px;
    }
    .value {
      font-size: 30px;
      margin-left: 0;
    }
  }
  .value {
    margin-left: auto;
  }

  p { 
      font-size: 11px;
      line-height: 1.2;
  }
</style>

<div class="info">
  <div class="table">
    <div class="stop-watch">
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
      <div class="label">Crossovers:</div>
      <div class="value">{crossoversCount}</div>
    </div>
    <div class="row row-result">
      <div class="label">Best result:</div>
      <div class="value">{ bestValue}</div>
    </div>
  </div>

  <div class="paths">
    <div class="paths-row">
      <div class="label-row">Сhange of the best result</div>
      <div class="value-row">
        <p>{bestValuesString}</p>
      </div>
    </div>
  
    <div class="paths-row">
      <div class="label-row">Best path</div>
      <div class="value-row">
        <p>{best.toString()}</p>
      </div>
    </div>

    <div class="paths-row">
      <div class="label-row">Best path in current population</div>
      <div class="value-row">
        <p>{bestPopulation}</p>
      </div>
    </div>

    <div class="paths-row">
      <div class="label-row">Best value in population</div>
      <div class="value-row">
        <p>{currentBest.bestValue}</p>
      </div>
    </div>

    <div class="paths-row">
      <div class="label-row">Population</div>
      <div class="value-row">
        {#each population as item}
          <p>{item.toString()}</p>
        {/each}
      </div>
    </div>
  </div>
</div>
