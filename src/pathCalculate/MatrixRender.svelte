<script>
  import { fly } from 'svelte/transition';

  export let graph, metroImage;
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  h3 {
    margin-bottom: 20px;
  }

  .matrix-render {
    margin-bottom: 30px;

      &__data {
        display: flex;

        .metro-image {
          margin-left: auto;
          max-width: 35%;
          min-width: 35%;

          img {
            width: 100%;
          }
        }

        .metro-table-wrapper {
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          max-height: 500px;
          margin-right: 20px;
        }

        .metro-table {
          font-size: 10px;
          border-spacing: 0;

          text-align: right;
          font-family: monospace; 
          width: 100%;
          padding-bottom: 20px;

          &__hd {
            font-weight: 600;
            background: $background-color--base;
          }

          td {
            width: 20px;
            padding: 1px 2px;
          }
        }
      }
  }
</style>

<div class="matrix-render" in:fly="{{ y: 50, duration: 1000 }}">
  <h3>Adjacency matrix of the metrograph</h3>

  <div class="matrix-render__data">
    <div class="metro-table-wrapper">
      <table class="metro-table">
          <tr>
            <td></td>
            {#each graph.nodes() as node1}
              <td class="metro-table__hd">{node1}</td>
            {/each}
          </tr>

          {#each graph.nodes() as node1}
            <tr>
              <td class="metro-table__hd">{node1}</td>
              {#each graph.nodes() as node2}
                <td>{graph.getEdgeWeight(node1, node2)}</td>
              {/each}
            <tr>
          {/each}
        </table>
      
    </div>

    <div class="metro-image">
      <img alt="metro-image" src={metroImage}/>
    </div>
  </div>
</div>