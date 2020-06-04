var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function (bond, proposal, reason) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['pr']);

    var BondData = loader.at("BondData", bond);
    var id = await BondData.id();

    var Vote = loader.load('Vote');

    logger.info(util.format("prcast/Vote(%s).prcast(%s, %s, %s)", Vote.address(), id, proposal, reason));
    await Vote.prcast(id, proposal, reason);

    logger.info("prcast finished");
}