import Graph from "graph-data-structure";

export default function createGraph(data = [], timeOnStation = 0) {
  function getWeight(weight) {
    return weight + timeOnStation;
  }

  const graphTemp = Graph();
  const graph = Graph();

  data
    .map(item => ({
      ...item,
      weight: getWeight(item.weight)
    }))
    .map(item => {
      graphTemp.addEdge(item.from, item.to, item.weight);
      graphTemp.addEdge(item.to, item.from, item.weight);
    });

  let stationsBetween = [];

  graphTemp.nodes().map((i, index) => {
    stationsBetween.push([]);

    graphTemp.nodes().map(j => {
      let path = graphTemp.shortestPath(i, j);
      // TODO: Maybe subtract time of station * path.length
      path = subsctractTimeOfStation(path, timeOnStation);
      graph.addEdge(i, j, path.weight);
      stationsBetween[index].push(path);
    });
  });

  const distances = countDistances(graph);

  return { graph, stationsBetween, distances };
}

function subsctractTimeOfStation(path, timeOnStation) {
  if (path.length > 2) {
    path.weight = path.weight - (path.length - 2) * timeOnStation;
  }

  return path;
}

function countDistances(graph) {
  const points = graph.nodes();
  const length = points.length;

  return Array.apply(null, Array(length)).map((item, index) =>
    Array.apply(null, Array(length)).map(
      (item, insideIndex) =>
        ~~graph.getEdgeWeight(points[index], points[insideIndex])
    )
  );
}
