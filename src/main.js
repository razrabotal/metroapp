import App from './App.svelte';
import initArrayPrototypes from "./helpers/arrayExtends";

initArrayPrototypes();

const app = new App({
	target: document.body
});

export default app;