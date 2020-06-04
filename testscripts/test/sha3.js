var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");

// module.exports = async function (text) {
//     var loader = new Loader(testenv.network);
//     var hash = await loader.web3.utils.sha3("\x19Ethereum Signed Message:\n" + text.length + text);
//     logger.info("sha3/hash: ", hash);
// }

//var hash1 = keccak256( abi.encode(a, b, c, d) )
//var hash2 = keccak256( abi.encodePacked("\x19Ethereum Signed Message:\n32", hash1));
module.exports = async function (types, values) {
    var loader = new Loader(testenv.network);
    //keccak256( abi.encode(a, b, c, d) )
    //var text = loader.web3.eth.abi.encodeParameters(['address', 'address', 'uint256'], ["0xEEaEa1397B40e20fe7D3FdEF318FCB4916Beab04", "0x573f2001741544163a35a35c67fff3508d88f538", 0]);
    var text = loader.web3.eth.abi.encodeParameters(types, values);
    var hash = await loader.web3.utils.soliditySha3(text);

    //keccak256( abi.encodePacked(a, b, c, d) )
    hash = await loader.web3.utils.soliditySha3({ "type": "string", "value": "\x19Ethereum Signed Message:\n32" }, {
        "type": "bytes32", "value": hash
    });

    logger.info("sha3/hash: ", hash);
}