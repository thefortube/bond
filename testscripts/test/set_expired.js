var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var time = require("../utils/time.js");
var util = require("util");

module.exports = async function (bond, what, exp) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['owner']);

    var BondData = loader.at('BondData', bond);

    if(what == "vote") {
        logger.info(util.format("set_expired/BondData(%s).setVoteExpired(%s)", BondData.address(), exp));
        await BondData.setBondParam("voteExpired", exp);
        
        var vote_expired = await BondData.voteExpired(exp);
        logger.info("BondData.voteExpired: ", time.date(vote_expired), ", now: ", time.date(time.now()));    
    }

    if(what == "invest") {
        logger.info(util.format("set_expired/BondData(%s).setInvestExpired(%s)", BondData.address(), exp));
        await BondData.setBondParam("investExpired", exp);

        var invest_expired = await BondData.investExpired(exp);
        logger.info("BondData.investExpired: ", time.date(invest_expired), ", now: ", time.date(time.now()));
    }

    logger.info("set_expired finished");
}