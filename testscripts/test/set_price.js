var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function (token, price, exp) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['owner']);

    var Oracle = loader.load('Oracle');

    logger.info(util.format("set_price/Oracle(%s).set(%s, %s, %s)", Oracle.address(), token, price, exp));
    await Oracle.set(token, price, exp);

    var ERC20 = loader.at("ERC20", token);
    var price = await Oracle.getPrice(token);
    var symbol = await ERC20.symbol();

    logger.info("set " + symbol + " price to: ", price);
    logger.info("set_price finished");
}