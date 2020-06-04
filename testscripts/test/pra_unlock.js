var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function () {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['pr']);
    var older = loader.sender.address();

    loader.checkout_sender(testenv.role['owner']);

    var PRA = loader.load("PRA");
    logger.info(util.format("vote/PRA(%s).set(%s, false)", PRA.address(), older));
    await PRA.set(older, false);

    loader.checkout_sender(testenv.role['pr']);
    PRA = loader.load("PRA");
    logger.info(util.format("vote/PRA(%s).unlock()", PRA.address()));
    await PRA.unlock();

    logger.info("pra_unlock finished");
}