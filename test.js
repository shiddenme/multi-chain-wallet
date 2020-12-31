
const R = require('ramda')
var vin = [
  {
    "value": 0.00030129,
    "n": 382,
    "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 226a8e86f16ed394f41e837e737183c9442d3405 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914226a8e86f16ed394f41e837e737183c9442d340588ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
            "148ydDTXQVM8CEsYG34X8dUrV9vpe8zB5P"
        ]
    }
},
];
var vout =  [
  {
      "value": 0.00030129,
      "n": 382,
      "scriptPubKey": {
          "asm": "OP_DUP OP_HASH160 226a8e86f16ed394f41e837e737183c9442d3405 OP_EQUALVERIFY OP_CHECKSIG",
          "hex": "76a914226a8e86f16ed394f41e837e737183c9442d340588ac",
          "reqSigs": 1,
          "type": "pubkeyhash",
          "addresses": [
              "148ydDTXQVM8CEsYG34X8dUrV9vpe8zB5P"
          ]
      }
  },
  {
    "value": 0.00030129,
    "n": 382,
    "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 226a8e86f16ed394f41e837e737183c9442d3405 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914226a8e86f16ed394f41e837e737183c9442d340588ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
            "148ydDTXQVM8CEsYG34X8dUrV9vpe8zB5P"
        ]
    }
}
]
var a = R.reduce(R.add, 0)(R.map(R.prop('value'))(vin)) - R.reduce(R.add, 0)(R.map(R.prop('value'))(vout));
console.log('a =',a)