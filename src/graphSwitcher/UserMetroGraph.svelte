<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let jsonUrl;

  function onSubmit() {
    dispatch("onSubmitGraph", {
      graphUrl: jsonUrl
    });
  }
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  section {
    margin-bottom: 30px;
    display: flex;

    input {
      padding: 8px 10px;
      border: 1px solid #bbb;
      font-size: 16px;
      border-radius: 4px;
      width: 100%;
      margin-right: 8px;
    }

    button {
      @include button;
    }
  }
</style> 

<section>
  <input bind:value={jsonUrl} type="text"/>
  <button on:click={onSubmit}>Send</button>
</section>