var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function (bond, proposal, amount) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['voter']);
 
    var BondData = loader.at('BondData', bond);
    var ERC20 = loader.at("ERC20", testenv.gov);
    
    var sender = loader.sender.address();
    logger.info(util.format("ERC20(%s).balanceOf(%s)", testenv.gov, sender));
    var balance = await ERC20.balanceOf(sender);
    logger.info("FOR.balance: ", balance);
    if (Number(balance) < Number(amount)) {
        throw new Error("Insufficient FOR.balance to vote");
    }
    logger.info(util.format("vote/ERC20(%s).approve(%s, %s)", testenv.gov, BondData.address(), amount));
    await ERC20.approve(BondData.address(), amount);

    logger.info(util.format("vote/BondData(%s).vote(%s, %s)", bond, proposal, amount));
    await BondData.vote(proposal, amount);

    logger.info("vote finished");
}