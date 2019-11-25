export function countDistances(graph) {
  const points = graph.nodes();
  const length = points.length;

  return Array.apply(null, Array(length)).map((item, index) =>
    Array.apply(null, Array(length)).map(
      (item, insideIndex) =>
        ~~graph.getEdgeWeight(points[index], points[insideIndex])
    )
  );
}

export function evaluate(indivial, dis) {
  return indivial.reduce(
    (sum, element, index, array) => (sum += dis[element][array[index - 1]])
  );
}

export function randomIndivial(length) {
  return Array.from(Array(length).keys()).shuffle();
}

export function wheelOut(roulette = []) {
  const rand = Math.random();
  roulette.forEach((item, i) => {
    if (rand <= item) {
      return i;
    }
  });
  return 0;
}

export function createRoulette(values = []) {
  const fitnessValues = values.map(item => 1.0 / item);
  const sum = fitnessValues.reduce((tempSum, el) => (tempSum += el));

  let tempSum;
  return fitnessValues
    .map(item => item / sum)
    .map(item => (tempSum = (tempSum || 0) + item));
}

export function getCurrentBest(values) {
  const min = values.min();

  return {
    bestValue: min,
    bestPosition: values.indexOf(min)
  };
}

// const distance = (p1, p2, graph) => graph.getEdgeWeight(p1, p2);