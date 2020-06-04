var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");

module.exports = async function (hash) {
    var loader = new Loader(testenv.network);
    var receipt = await loader.web3.eth.getTransactionReceipt(hash);
    logger.info("getTransactionReceipt/receipt: ", receipt);
}