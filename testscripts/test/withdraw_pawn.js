var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");

module.exports = async function (bond) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['issuer']);

    var BondData = loader.at('BondData', bond);
    logger.info("withdraw_pawn/BondData.withdrawPawn()");
    await BondData.withdrawPawn();

    logger.info("withdraw_pawn finished");
}
