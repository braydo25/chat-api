const HashIds = require('hashids');
const hashids = new HashIds('c7vqPZevFV7g6KN6', 5, 'ABCDEFGHJKMNPQRTUVWXYZ123456789');

function encode(number) {
  return hashids.encode(number);
}

function decode(hashid) {
  return hashids.decode(hashid)[0];
}

module.exports = {
  encode,
  decode,
};
