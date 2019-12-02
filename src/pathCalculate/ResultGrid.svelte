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
  export let bestResultsFromStorage;

  $: bestPopulation =
    population[currentBest.bestPosition] ?
    population[currentBest.bestPosition].toString() : '';

  $: bestValuesString = bestValuesArray.join(" > ").toString();
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  .info {
    font-family: "Courier New", Courier, monospace;
    display: flex;
    flex-direction: column;
    padding: 10px;
    flex: 3;
    font-size: 15px;

    @include sm {
      padding: 20px;
      font-size: 14px;
    }
  }
  .table {
    display: flex;
    // max-width: 300px;
    flex: 1;
    padding: 10px 10px 0;

    &__content {
      flex: 1;
      margin-bottom: 20px;
      margin-left: 20px;
      
      @include sm {
        margin-bottom: 0;
      }
    }
  }
  .stop-watch {
    display: flex; 
    justify-content: center;
    margin-bottom: 20px;

    @include sm {
      margin-bottom: 0;
    }
  }
  .paths {
    padding: 10px;
    flex: 2;

    @include sm {
      padding: 10px 30px;
    }
  }
  .paths-row {
      margin-bottom: 6px;
    }
  .row {
    display: flex;
    margin-bottom: 10px;
  }
  .row-result {
    margin-top: 10px;
    margin-bottom: 0;

    .value {
      font-size: 20px;
      
      @include sm {
        font-size: 30px;
      }
    }
  }
  .value {
    margin-left: auto;
  }

  .label-row {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;

    @include sm {
      font-size: 14px;
    }
  }

  .value-row {
    word-break: break-word;
  }

  p { 
      font-size: 15px;
      line-height: 1.2;

      @include sm {
        font-size: 13px;
      }
  }
</style>

<div class="info">
  <div class="table">
    <div class="stop-watch">
      <StopWatch {running} />
    </div>
    <div class="table__content">
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

    <div class="paths-row">
      <div class="label-row">Best results from storage</div>
      <div class="value-row">
        {#each bestResultsFromStorage as item}
          {#if item.bestValue && item.bestPath}
            <p>{item.bestValue} - {item.bestPath.toString()}</p>
          {/if}
        {:else}
          <p>No paths in storage</p>
        {/each}
      </div>
    </div>

  </div>
</div>
