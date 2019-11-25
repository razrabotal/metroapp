<script>
  import Scheme from "./Scheme.svelte";
  import initArrayPrototypes from "./helpers/arrayExtends";
  
  initArrayPrototypes();
</script>

<style global lang="scss">
  @import "src/styles/index.scss"; 
</style>

<Scheme />