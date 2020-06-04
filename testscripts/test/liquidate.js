var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function (bond, amount) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['invester']);

    var BondData = loader.at('BondData', bond);
    var id = await BondData.id();

    var CoreUtils = loader.load("CoreUtils");

    logger.info(util.format("liquidate/CoreUtils(%s).isUnsafe(%s)", CoreUtils.address(), id));
    var isUnsafe = await CoreUtils.isUnsafe(id);
    logger.info("liquidate/isUnsafe: ", isUnsafe);

    if (isUnsafe) {
        var Y = await CoreUtils.Y(id);
        logger.info("liquidate/Y: ", Y);
        var X = await CoreUtils.X(id);
        logger.info("liquidate/X: ", X);

        if (Y < amount) {
            throw new Error(util.format("want to liquidate %s USDT but surplus Y is %s USDT", amount, Y));
        }

        logger.info(util.format("CoreUtils.getLiquidateAmount(%s, %s)", id, amount));
        var liquidated = await CoreUtils.getLiquidateAmount(id, amount); //{ '0': '472532724', '1': '277960425900000000000' }
        var liquidated_y = liquidated[0];
        var liquidated_x = liquidated[1];
        logger.info(util.format("want to liquidate %s Y, actual liquidate % Y and %s X", amount, liquidated_y, liquidated_x));

        logger.info("liquidate/BondData.crowdToken()");
        var issue_token = await BondData.crowdToken();
        logger.info("liquidate/issue_token: ", issue_token);
    
        var ERC20 = loader.at("ERC20", issue_token);

        var allowed = await ERC20.allowance(loader.sender.address(), bond);
        if (allowed < liquidated_y) {
            logger.info(util.format("liquidate/ERC20.approve(%s, %s)", bond, 0));
            await ERC20.approve(bond, 0);
            logger.info(util.format("liquidate/ERC20.approve(%s, %s)", bond, liquidated_y));
            await ERC20.approve(bond, liquidated_y);
        }
    
        logger.info(util.format("liquidate/BondData(%s).liquidate(%s)", bond, amount));
        await BondData.liquidate(amount);
    }

    logger.info("liquidate finished");
}