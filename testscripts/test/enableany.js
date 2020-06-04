var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function (who, to) {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['owner']);

    var ACL = loader.load('ACL');

    logger.info(util.format("enablany/ACL(%s).enableany(%s, %s)", ACL.address(), who, to));
    await ACL.enableany(who, to);

    logger.info("enableany finished");
}