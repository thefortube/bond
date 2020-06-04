var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var time = require("../utils/time.js");
var util = require("util");

module.exports = async function (bond) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['voter']);
    
    var BondData = loader.at("BondData", bond);

    var invest_expired = await BondData.investExpired();
    if(invest_expired > time.now()) {
        throw new Error("invest is unexpired, and expired at: " + time.date(invest_expired) + ", now: " + time.date(time.now()));
    }
    
    var id = await BondData.id();
    logger.info(util.format("invest_closed/Core.interestBearingPeriod(%s)", id));
    
    var Core = loader.load('Core');
    await Core.interestBearingPeriod(id);

    logger.info("invest_closed finished");
}