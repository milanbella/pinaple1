const R = require('ramda');

let query = {
  a: 1,
  b: 'bla bla',
}

let q = R.compose(R.join('&'), R.map((pair) => `${pair[0]}=${encodeURIComponent(pair[1])}`), R.toPairs)(query);
console.log(q);
