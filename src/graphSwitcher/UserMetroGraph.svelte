<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let graphJson = '';

  let source, target, weight;
  
  $: links = [];

  function onAdd() {
    links = [...links, {
      source,
      target,
      weight
    }];

    source = '';
    target = '';
    weight = '';

  }

  function onRemove(item) {
    links = links.filter(link => link !== item);
  }

  function onSubmit() {
    dispatch("onSubmitGraph", {
      result: graphJson
    });
  }
</script>

<style>
  section {
    margin-bottom: 30px;
  }
</style> 

<section>
  <p>Links:</p>
  {#each links as link, index}
     <p>{link.source} ←→ {link.target} = {link.weight} <button on:click={() => onRemove(link)}>Remove</button> </p> 
  {/each}

  <div>
  <input bind:value={source} type="text"/>
  <input bind:value={target} type="text"/>
  <input bind:value={weight} type="number"/>

  <button on:click={onAdd}>Send</button>
  </div>

  <button on:click={onSubmit}>Send</button>
</section>