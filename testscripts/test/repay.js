var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function (bond) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['issuer']);
    var sender = loader.sender.address();

    var BondData = loader.at('BondData', bond);

    logger.info("invest/BondData.crowdToken()");
    var issue_token = await BondData.crowdToken();
    logger.info("invest/issue_token: ", issue_token);
    var repay_amount = await BondData.liability();
    logger.info("invest/repay_amount: ", repay_amount);

    var ERC20 = loader.at("ERC20", issue_token);

    var balance = await ERC20.balanceOf(sender);
    logger.info("ERC20.balance: ", balance);
    if (Number(balance) < Number(repay_amount)) {
        throw new Error("Insufficient balance to repay");
    }

    var allowed = await ERC20.allowance(loader.sender.address(), bond);
    if (allowed < repay_amount) {
        logger.info(util.format("invest/ERC20.approve(%s, %s)", bond, 0));
        await ERC20.approve(bond, 0);
        logger.info(util.format("invest/ERC20.approve(%s, %s)", bond, repay_amount));
        await ERC20.approve(bond, repay_amount);
    }

    logger.info("cast/BondData.repay()");
    await BondData.repay();

    logger.info("repay finished");
}