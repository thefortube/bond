var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var time = require("../utils/time.js");
var testenv = require("../testenv");

module.exports = async function (bond) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['voter']);

    var BondData = loader.at('BondData', bond);

    var vote_expired = await BondData.voteExpired();

    if(vote_expired > time.now()) {
        throw new Error("vote is unexpired, and expired at: " + time.date(vote_expired) + ", now: " + time.date(time.now()));
    }

    logger.info("take/BondData.take()");
    await BondData.take();

    logger.info("take finished");
}