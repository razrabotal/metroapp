import { randomNumber } from "../helpers/randomNumber";

export function pushMutateMath(seq) {
  var m, n;
  do {
    m = randomNumber(seq.length >> 1);
    n = randomNumber(seq.length);
  } while (m >= n);

  var s1 = seq.slice(0, m);
  var s2 = seq.slice(m, n);
  var s3 = seq.slice(n, seq.length);
  return s2
    .concat(s1)
    .concat(s3)
    .clone();
}

export function doMutateMath(seq) {
  let m, n;
    do {
      m = randomNumber(seq.length - 2);
      n = randomNumber(seq.length);
    } while (m >= n);

    for (var i = 0, j = (n - m + 1) >> 1; i < j; i++) {
      seq.swap(m + i, n - i);
    }
    return seq;
}

export function reverseMutateMath(seq) {
  const reversed = seq.reverse();

  return reversed;
}

// No use
// export function preciseMutate(orseq, dis) {
//   var seq = orseq.clone();
//   if (Math.random() > 0.5) {
//     seq.reverse();
//   }
//   var bestv = evaluate(seq, dis);
//   for (var i = 0; i < seq.length >> 1; i++) {
//     for (var j = i + 2; j < seq.length - 1; j++) {
//       var new_seq = swap_seq(seq, i, i + 1, j, j + 1);
//       var v = evaluate(new_seq, dis);
//       if (v < bestv) {
//         bestv = v;
//         seq = new_seq;
//       }
//     }
//   }
//   return seq;
// }
// export function preciseMutate1(orseq, dis) {
//   var seq = orseq.clone();
//   var bestv = evaluate(seq, dis);

//   for (var i = 0; i < seq.length - 1; i++) {
//     var new_seq = seq.clone();
//     new_seq.swap(i, i + 1);
//     var v = evaluate(new_seq, dis);
//     if (v < bestv) {
//       bestv = v;
//       seq = new_seq;
//     }
//   }
//   return seq;
// }
// function swap_seq(seq, p0, p1, q0, q1) {
//   var seq1 = seq.slice(0, p0);
//   var seq2 = seq.slice(p1 + 1, q1);
//   seq2.push(seq[p0]);
//   seq2.push(seq[p1]);
//   var seq3 = seq.slice(q1, seq.length);
//   return seq1.concat(seq2).concat(seq3);
// }