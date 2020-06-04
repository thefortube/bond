var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var time = require("../utils/time.js");
var util = require("util");

module.exports = async function (bond) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['voter']);
 
    var BondData = loader.at("BondData", bond);
    var id = await BondData.id();

    var vote_expired = await BondData.voteExpired();

    if(vote_expired > time.now()) {
        throw new Error("vote is unexpired, and expired at: " + time.date(vote_expired) + ", now: " + time.date(time.now()));
    }

    var Vote = loader.load('Vote');
    logger.info(util.format("vote/Vote(%s).rating(%s)", Vote.address(), id));
    await Vote.rating(id);

    logger.info("rating finished");
}