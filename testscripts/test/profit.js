var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");

module.exports = async function (bond, role) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role[role]);

    var BondData = loader.at('BondData', bond);
    logger.info("profit/BondData.profit()");

    await BondData.profit();
    logger.info("profit finished");
}