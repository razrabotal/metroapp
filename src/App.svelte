<script>
  import Scheme from "./Scheme.svelte";
  import { initArrayPrototypes } from "./Untils";
  
  initArrayPrototypes();
</script>

<style lang="scss">
  @import "src/styles/index.scss";

  :global(body) { 
    font-family: Tahoma;
  }

</style>

<Scheme />