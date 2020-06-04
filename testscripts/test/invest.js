var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function (bond, amount) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['invester']);

    var BondData = loader.at("BondData", bond);

    logger.info("invest/BondData.crowdToken()");
    var issue_token = await BondData.crowdToken();
    logger.info("invest/issue_token: ", issue_token);

    var ERC20 = loader.at("ERC20", issue_token);

    var allowed = await ERC20.allowance(loader.sender.address(), bond);
    if (allowed < amount) {
        logger.info(util.format("invest/ERC20.approve(%s, %s)", bond, 0));
        await ERC20.approve(bond, 0);
        logger.info(util.format("invest/ERC20.approve(%s, %s)", bond, amount));
        await ERC20.approve(bond, amount);
    }

    logger.info("invest/BondData.invest(" + amount + ")");
    await BondData.invest(amount);

    logger.info("invest finished");
}