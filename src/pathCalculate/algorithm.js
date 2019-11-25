import { randomNumber } from "../helpers/randomNumber";
import { pushMutateMath, doMutateMath, reverseMutateMath } from "./mutations";
import { count } from "./store.js";
import {
  POPULATION_SIZE,
  CROSSOVER_PROBABILITY,
  MUTATION_PROBABILITY
} from "./constants";

// Functions with side effects
function mutationIteration(array) {
  count.update(n => n + 1);
  return array;
}
const reverseMutate = seq => mutationIteration(reverseMutateMath(seq));
const doMutate = seq => mutationIteration(doMutateMath(seq));
const pushMutate = seq => mutationIteration(pushMutateMath(seq));

// Main components
export function selection(population, currentBest, best, values) {
  let newPopulation = population.clone();

  let parents = new Array();
  let initnum = 5;
  parents.push(newPopulation[currentBest.bestPosition]);
  parents.push(doMutate(best.clone()));
  parents.push(pushMutate(best.clone()));
  parents.push(reverseMutate(best.clone()));
  parents.push(best.clone());

  const roulette = createRoulette(values);

  for (let i = initnum; i < POPULATION_SIZE; i++) {
    parents.push(newPopulation[wheelOut(roulette)]);
  }
  newPopulation = parents;

  return newPopulation;
}

export function mutation(population) {
  let newPopulation = population.clone();
  for (let i = 0; i < POPULATION_SIZE; i++) {
    if (Math.random() < MUTATION_PROBABILITY) {
      if (Math.random() > 0.5) {
        newPopulation[i] = doMutate(population[i]);
      } else {
        newPopulation[i] = pushMutate(population[i]);
      }
      i--;
    }
  }
  return newPopulation;
}

export function crossover(population, dis) {
  let queue = new Array();
  for (let i = 0; i < POPULATION_SIZE; i++) {
    if (Math.random() < CROSSOVER_PROBABILITY) {
      queue.push(i);
    }
  }
  queue.shuffle();
  for (let i = 0, j = queue.length - 1; i < j; i += 2) {
    population = doCrossover(queue[i], queue[i + 1], population, dis);
  }

  return population;
}

// Helper functions
function createRoulette(values = []) {
  const fitnessValues = values.map(item => 1.0 / item);
  const sum = fitnessValues.reduce((tempSum, el) => (tempSum += el));

  let tempSum;
  return fitnessValues
    .map(item => item / sum)
    .map(item => (tempSum = (tempSum || 0) + item));
}

function doCrossover(x, y, population, dis) {
  let newPopulation = population.clone();

  let child1 = getChild("next", x, y, newPopulation, dis);
  let child2 = getChild("previous", x, y, newPopulation, dis);
  newPopulation[x] = child1;
  newPopulation[y] = child2;

  return newPopulation;
}

function getChild(fun, x, y, population, dis) {
  let solution = new Array();
  let px = population[x].clone();
  let py = population[y].clone();
  let dx, dy;
  let c = px[randomNumber(px.length)];
  solution.push(c);
  while (px.length > 1) {
    dx = px[fun](px.indexOf(c));
    dy = py[fun](py.indexOf(c));
    px.deleteByValue(c);
    py.deleteByValue(c);
    c = dis[c][dx] < dis[c][dy] ? dx : dy;
    solution.push(c);
  }
  return solution;
}

function wheelOut(roulette = []) {
  const rand = Math.random();
  roulette.forEach((item, i) => {
    if (rand <= item) {
      return i;
    }
  });
  return 0;
}