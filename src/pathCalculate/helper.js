export function evaluate(indivial, dis) {
  return indivial.reduce(
    (sum, element, index, array) => (sum += dis[element][array[index - 1]])
  );
}

export function randomIndivial(length) {
  return Array.from(Array(length).keys()).shuffle();
}

export function getCurrentBest(values) {
  const min = values.min();

  return {
    bestValue: min,
    bestPosition: values.indexOf(min)
  };
}