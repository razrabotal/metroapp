import createGraph from "./graphBuilder";

let cache = {};

export async function getGraph(url, timeOnStation) {
  const res = await fetch(url);
  const data = await res.json();
  return createGraph(data, timeOnStation);
}
export async function getStations(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};
export async function getScheme(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

export async function getData(variable, func) {
  if (cache[variable]) {
    return cache[variable];
  }
  const result = await func();
  cache[variable] = result;
  return result;
}