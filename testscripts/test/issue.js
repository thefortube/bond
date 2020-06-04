var Loader = require('../contract/loader.js');
var logger = require("../utils/logger.js");
var testenv = require("../testenv");
var util = require("util");
var BigNumber = require("bignumber.js");
var path = require("path");
var fs = require("fs");

//arguments[0]: deposit_token address
//arguments[1]: issue_token address
//arguments[2]: issue_amount,
//arguments[3]: interest_rate,
//arguments[4]: duration,
//arguments[5]: issue_fee,
//arguments[6]: minimux_issue_ratio,
//arguments[7]: 融资用途 (uint256)
//arguments[8]: 还款来源 (uint256)
//arguments[9]: 当前时间(now)

// arguments[10]: 是否可赎回 bool
// arguments[11]: 是否可回售 bool

module.exports = async function (arguments) {
    logger.info("issue/arguments: ", arguments);

    var loader = new Loader(testenv.network);
    loader.checkout_sender(testenv.role['issuer']);

    var deposit_token = arguments[0];
    var issue_token = arguments[1];
    var issue_amount = arguments[2];

    var Config = loader.load("Config");
    var Oracle = loader.load("Oracle");

    var deposit_multiple = await Config.depositMultiple(deposit_token);
    logger.info("issue/deposit_multiple: ", deposit_multiple);

    var issue_token_price = await Oracle.getPrice(issue_token);
    logger.info("issue/issue_token_price: ", issue_token_price);

    var deposit_token_price = await Oracle.getPrice(deposit_token);
    logger.info("issue/deposit_token_price: ", deposit_token_price);

    var ERC20_deposit_token = loader.at("ERC20", deposit_token);
    var ERC20_issue_token = loader.at("ERC20", issue_token);

    var deposit_token_decimals = await ERC20_deposit_token.decimals();
    deposit_token_decimals = BigNumber(10).pow(deposit_token_decimals);

    var issue_token_decimals = await ERC20_issue_token.decimals();
    issue_token_decimals = BigNumber(10).pow(issue_token_decimals);

    var minimux_deposit_amount = BigNumber(issue_amount)
        .multipliedBy(deposit_multiple)
        .multipliedBy(issue_token_price)
        .multipliedBy(deposit_token_decimals)
        .dividedBy(deposit_token_price)
        .dividedBy(issue_token_decimals)
	.dividedBy(1e18)
        .toFixed(0, BigNumber.ROUND_UP);
    logger.info("issue/minimux_deposit_amount: ", minimux_deposit_amount);

    var BondFactory = loader.load('BondFactory');
    var ERC20 = loader.at("ERC20", deposit_token);

    logger.info(util.format("issue/ERC20(%s).approve(%s, %s)", deposit_token, BondFactory.address(), minimux_deposit_amount));
    await ERC20.approve(BondFactory.address(), minimux_deposit_amount);

    var tokens = arguments.slice(0, 2);
    var basics = arguments.slice(2, 10);
    var flags = arguments.slice(10, 12);

    logger.info(util.format("issue/BondFactory.issue(%o, %s, %o, %o)", tokens, minimux_deposit_amount, basics, flags));

    await BondFactory.issue(tokens, minimux_deposit_amount, basics, flags);

    var Router = loader.load("Router");
    var n = await Router.bondNr();
    var bond = await Router.routerDataMap(n - 1);
    logger.info("bond: " + bond);
    fs.writeFileSync(path.join(process.cwd(), testenv.export), bond);
    return bond;
}
