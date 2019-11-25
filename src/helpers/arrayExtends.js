import { randomNumber } from "./randomNumber";

export default function initArrayPrototypes() {
  Array.prototype.clone = function() {
    return this.slice(0);
  };
  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };
  Array.prototype.min = function() {
    return Math.min.apply(null, this);
  };
  Array.prototype.shuffle = function() {
    for (
      var j, x, i = this.length - 1;
      i;
      j = randomNumber(i), x = this[--i], this[i] = this[j], this[j] = x
    );
    return this;
  };
  Array.prototype.indexOf = function(value) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === value) {
        return i;
      }
    }
  };
  Array.prototype.deleteByValue = function(value) {
    var pos = this.indexOf(value);
    this.splice(pos, 1);
  };
  Array.prototype.next = function(index) {
    if (index === this.length - 1) {
      return this[0];
    } else {
      return this[index + 1];
    }
  };
  Array.prototype.previous = function(index) {
    if (index === 0) {
      return this[this.length - 1];
    } else {
      return this[index - 1];
    }
  };
  Array.prototype.swap = function(x, y) {
    if (x > this.length || y > this.length || x === y) {
      return;
    }
    var tem = this[x];
    this[x] = this[y];
    this[y] = tem;
  };
  Array.prototype.roll = function() {
    var rand = randomNumber(this.length);
    var tem = [];
    for (var i = rand; i < this.length; i++) {
      tem.push(this[i]);
    }
    for (var i = 0; i < rand; i++) {
      tem.push(this[i]);
    }
    return tem;
  };
}