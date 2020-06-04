var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function (bond) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['issuer']);
 
    var BondData = loader.at('BondData', bond);
    
    var bondStage = await BondData.bondStage();
    logger.info("get_bond_data/bondStage: ", bondStage);

    var isserStage = await BondData.issuerStage();
    logger.info("get_bond_data/isserStage: ", isserStage);


    logger.info("vote finished");
}