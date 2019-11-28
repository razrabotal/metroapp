<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // let graphJson = '';

  let source, target, weight, jsonUrl;
  
  // $: links = [];

  // function onAdd() {
  //   links = [...links, {
  //     source,
  //     target,
  //     weight
  //   }];

  //   source = '';
  //   target = '';
  //   weight = '';

  // }

  // function onRemove(item) {
  //   links = links.filter(link => link !== item);
  // }

  function onSubmit() {
    dispatch("onSubmitGraph", {
      graphUrl: jsonUrl,
      stationsUrl: ''
    });
  }
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  section {
    margin-bottom: 30px;
    display: flex;
  }

  .json-input {
    padding: 8px 10px;
    border: 1px solid #bbb;
    font-size: 16px;
    border-radius: 4px;
    width: 100%;
    margin-right: 8px;
  }

  .json-button {
    @include button;
  }
</style> 

<section>
  <!-- <p>Links:</p>
  {#each links as link, index}
     <p>{link.source} ←→ {link.target} = {link.weight} <button on:click={() => onRemove(link)}>Remove</button> </p> 
  {/each}

  <div>
  <input bind:value={source} type="text"/>
  <input bind:value={target} type="text"/>
  <input bind:value={weight} type="number"/>

  <button on:click={onAdd}>Send</button>
  </div> -->

  <input class="json-input" bind:value={jsonUrl} type="text"/>

  <button class="json-button" on:click={onSubmit}>Send</button>
</section>