var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");

module.exports = async function (bond) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['invester']);

    var BondData = loader.at('BondData', bond);

    logger.info("invester_withdraw/BondData.bondStage()");
    var bondStage = await BondData.bondStage();
    logger.info("invester_withdraw/bondStage: ", bondStage);
    if(bondStage == 5) {  //CrowdFundingFail 
        logger.info("invester_withdraw/BondData.withdrawPrincipal()");
        await BondData.withdrawPrincipal();
    } else {
        logger.info("invester_withdraw/BondData.withdrawPrincipalAndInterest()");
        await BondData.withdrawPrincipalAndInterest();
    }

    logger.info("invester_withdraw finished");
}
