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


    // var serialized = graph.serialize();

    // debugger;


  let stationsBetween = [];

  graph.nodes().map((i, index) => {
    stationsBetween.push([]);

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


//   graph.nodes().map((i, index) => {
//     stationsBetween.push([]);

//     graph.nodes().map((j, insideIndex) => {
//       const path = graph.shortestPath(i, j);
//       const cleanPath = path.slice();

//       if(i == 26) {
// debugger;
//       }

//       stationsBetween[index].push(cleanPath);

//       graph.addEdge(i, j, path.weight);
//     });
//   });


  return { graph, stationsBetween };
}
