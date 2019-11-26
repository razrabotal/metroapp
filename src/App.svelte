<script>
  import Scheme from "./Scheme.svelte";
  import initArrayPrototypes from "./helpers/arrayExtends";
  
  initArrayPrototypes();
</script>

<style global lang="scss">
  @import "src/styles/index.scss"; 

  main { 
    width: 100%;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }
</style>

<main>
  <Scheme />
</main>