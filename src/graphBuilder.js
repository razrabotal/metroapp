import Graph from "graph-data-structure";

export default function createGraph(data) {
  const INTERVAL_TIME = 6;

  function getWeight(weight) {
    return weight + INTERVAL_TIME;
  }

  const graph = Graph();

  data
    .map(item => ({
      ...item,
      weight: getWeight(item.weight)
    }))
    .map(item => {
      graph.addEdge(item.from, item.to, item.weight);
      graph.addEdge(item.to, item.from, item.weight);
    });

  let stationsBetween = [];

  graph.nodes().map((i, index) => {
    stationsBetween.push([]);
    
    graph.nodes().map((j, insideIndex) => {
      const path = graph.shortestPath(i, j);
      const cleanPath = path.slice();
      stationsBetween[index].push(cleanPath);
    });
  });

  graph.nodes().map((i, index) => {
    graph.nodes().map((j, insideIndex) => {
      const path = graph.shortestPath(i, j);
      graph.addEdge(i, j, path.weight);
    });
  });

  const distances = countDistances(graph);

  return { graph, stationsBetween, distances };
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
