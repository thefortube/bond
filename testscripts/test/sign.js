var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");

// module.exports = async function (text) {
//     var loader = new Loader(testenv.network);
//     var signers = testenv.role['signers'];
//     var promises = [];
//     for(let i = 0; i < signers.length; ++i) {
//         loader.checkout_sender(signers[i]);
//         //https://web3js.readthedocs.io/en/v1.2.0/web3-eth-accounts.html#sign
//         //var sign = await loader.web3.eth.accounts.sign(text, loader.sender.pk);
//         promises.push(loader.web3.eth.accounts.sign(text, loader.sender.pk))
//     }

//     var signs = await Promise.all(promises);
//     logger.info("sign/signs: ", signs);
// }

module.exports = async function (types, values) {
    var loader = new Loader(testenv.network);
    var signers = testenv.role['signers'];

    //var text = loader.web3.eth.abi.encodeParameters(['address', 'address', 'uint256'], ["0xEEaEa1397B40e20fe7D3FdEF318FCB4916Beab04", "0x573f2001741544163a35a35c67fff3508d88f538", 0]);
    var text = loader.web3.eth.abi.encodeParameters(types, values);
    var hash = await loader.web3.utils.soliditySha3(text);

    var promises = [];
    
    for(let i = 0; i < signers.length; ++i) {
        loader.checkout_sender(signers[i]);
        //https://web3js.readthedocs.io/en/v1.2.0/web3-eth-accounts.html#sign
        //var sign = await loader.web3.eth.accounts.sign(text, loader.sender.pk);
        promises.push(loader.web3.eth.accounts.sign(hash, loader.sender.pk))
    }

    var signs = await Promise.all(promises);
    logger.info("sign/signs: ", JSON.stringify(signs, null, 4));


    //format

    var v = [];
    var r = [];
    var s = [];

    for(let i = 0; i < signs.length; ++i) {
        let sign = signs[i];

        v.push(sign.v);
        r.push(sign.r);
        s.push(sign.s);
    }
    
    logger.info("sign/v: ", JSON.stringify(v));
    logger.info("sign/r: ", JSON.stringify(r));
    logger.info("sign/s: ", JSON.stringify(s));
}