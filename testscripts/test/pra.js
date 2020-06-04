var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");

module.exports = async function () {
    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['pr']);
    
    var sender = loader.sender.address();
    var line = testenv.pra_deposits_line;

    var PRA = loader.load('PRA');
    var ERC20 = loader.at("ERC20", testenv.gov);

    var israter = await PRA.raters(sender);
    if (!israter) {
        var balance = await ERC20.balanceOf(sender);
        if (Number(balance) < Number(line)) {
            throw new Error("Insufficient 'FOR' balance to deposit pra");
        }
        logger.info(util.format("vote/ERC20(%s).approve(%s, %s)", testenv.gov, PRA.address(), line));
        await ERC20.approve(PRA.address(), line);

        logger.info(util.format("vote/PRA(%s).lock()", PRA.address()));
        await PRA.lock();
        var older = sender;
        loader.checkout_sender(testenv.role['owner']);
        sender = loader.sender.address();
        PRA = loader.load("PRA");
        logger.info(util.format("vote/PRA(%s).set(%s, true)", PRA.address(), older));
        await PRA.set(older, true);
    }

    logger.info("pra finished");
}