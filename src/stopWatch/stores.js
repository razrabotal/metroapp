import { readable } from "svelte/store";

export const time = readable(0, function start(set) {
  const beginning = new Date();
  const beginningTime = beginning.getTime();

  const interval = setInterval(() => {
    const currentTime = new Date().getTime();
    set(currentTime - beginningTime);
  }, 10);

  return function stop() {
    set(0);
    clearInterval(interval);
  };
});
