var Config = artifacts.require("Config");
var ACL = artifacts.require("ACL");

var BigNumber = require('bignumber.js');
var deployenv = require("../deployenv.json");

var fs = require("fs");
var util = require("util");

// truffle exec ./migrations/initial_fortube.js --network ropsten

var output = 'exec_fortube_migrations_init.log';

var addresses = {

}

module.exports = async function (callback) {
    try {
        var logger = fs.createWriteStream(output, { flags: 'a' });

        if (fs.existsSync(output)) {
            fs.unlinkSync(output);
        }

        var network = await web3.eth.net.getNetworkType();
        logger.write("init for network: " + network + "\n");

	if (network === "main") {
	    network = "mainnet";
	}

        var env = deployenv[network];
        logger.write("init use env: " + JSON.stringify(env) + "\n");

        var config_address = addresses["Config"];
        var config = await Config.at(config_address);

        await config.setVoteDuration(env.durations.vote_duration);
        await config.setDepositDuration(env.durations.deposit_duration);
        await config.setInvestDuration(env.durations.invest_duration);
        await config.setGrasePeriod(env.durations.grase_period);

        var deposit_tokens = env.deposit_tokens;
        var deposit_token_addresses = [];
        for (let i = 0; i < deposit_tokens.length; ++i) {
            let deposit_token = deposit_tokens[i];

            let discount = BigNumber(deposit_token.discount).multipliedBy(1e18).dividedBy(100).toFixed();
            let liquidate_line = BigNumber(deposit_token.liquidate_line).multipliedBy(1e18).dividedBy(100).toFixed();
            let deposit_multiple = deposit_token.deposit_multiple;

            let issue_amount = deposit_token.issue_amount;
            for (let i = 0; i < issue_amount.length; ++i) {
                let _issue_amount = issue_amount[i];
                let decimals = BigNumber(10).pow(_issue_amount.decimals);
                let maximum_issue_amount = BigNumber(_issue_amount.maximum_issue_amount).multipliedBy(decimals).toFixed();
                let minimum_issue_amount = BigNumber(_issue_amount.minimum_issue_amount).multipliedBy(decimals).toFixed();

                logger.write("symbol: " + deposit_token.symbol + ", address: " + deposit_token.address + ", maximum_issue_amount: " + maximum_issue_amount + "\n");
                logger.write("symbol: " + deposit_token.symbol + ", address: " + deposit_token.address + ", minimum_issue_amount: " + minimum_issue_amount + "\n");

                await config.setMaxIssueAmount(deposit_token.address, _issue_amount.address, maximum_issue_amount);
                await config.setMinIssueAmount(deposit_token.address, _issue_amount.address, minimum_issue_amount);
            }

            logger.write("symbol: " + deposit_token.symbol + ", address: " + deposit_token.address + ", discount: " + discount + "\n");
            logger.write("symbol: " + deposit_token.symbol + ", address: " + deposit_token.address + ", liquidate_line: " + liquidate_line + "\n");
            logger.write("symbol: " + deposit_token.symbol + ", address: " + deposit_token.address + ", deposit_multiple: " + deposit_multiple + "\n");

            await config.setDiscount(deposit_token.address, discount);
            await config.setLiquidateLine(deposit_token.address, liquidate_line);
            await config.setDepositMultiple(deposit_token.address, deposit_multiple);

            deposit_token_addresses.push(deposit_token.address);
        }

        logger.write("config.setDepositTokenCandidates: " + JSON.stringify(deposit_token_addresses) + "\n");
        await config.setDepositTokenCandidates(deposit_token_addresses, true);

        var issue_tokens = env.issue_tokens;
        var issue_token_addresses = [];
        var promises = [];
        for (let i = 0; i < issue_tokens.length; ++i) {
            let issue_token = issue_tokens[i];

            let decimals = BigNumber(10).pow(issue_token.decimals);
            let partial_liquidate_amount = BigNumber(issue_token.partial_liquidate_amount).multipliedBy(decimals).toFixed();

            logger.write("symbol: " + issue_token.symbol + ", address: " + issue_token.address + ", partial_liquidate_amount: " + partial_liquidate_amount + "\n");
            promises.push(config.setPartialLiquidateAmount(issue_token.address, partial_liquidate_amount));

            issue_token_addresses.push(issue_tokens[i].address);
        }

        await Promise.all(promises);

        logger.write("config.setIssueTokenCandidates: " + JSON.stringify(issue_token_addresses) + "\n");
        await config.setIssueTokenCandidates(issue_token_addresses, true);

        var issue_fees = env.issue_fees;
        var formatted_issue_fees = [];
        for (let i = 0; i < issue_fees.length; ++i) {
            let issue_fee = BigNumber(issue_fees[i]).dividedBy(100).multipliedBy(1e18).toFixed();
            formatted_issue_fees.push(issue_fee);
        }

        logger.write("config.setIssueFeeCandidates: " + JSON.stringify(formatted_issue_fees) + "\n");
        await config.setIssueFeeCandidates(formatted_issue_fees, true);

        var interest_rates = env.interest_rates;
        var maturities = env.maturities;
        var formatted_interest_rates = [];

        //  计算一期的利率
        //  年化利率: 8%
        //  债券期限: 14天
        //  toWei((年化利率 / 365) *  债券期限) => toWei((0.08 / 365) * 14)

        for (let i = 0; i < interest_rates.length; ++i) {
            for (let j = 0; j < maturities.length; ++j) {
                let interest_rate = BigNumber(interest_rates[i])
                    .multipliedBy(maturities[j])
                    .multipliedBy(1e18)
                    .dividedBy(365)
                    .dividedBy(100)
                    .toFixed(0);
                formatted_interest_rates.push(interest_rate);
            }
        }

        logger.write("config.setInterestRateCandidates: " + JSON.stringify(formatted_interest_rates) + "\n");
        await config.setInterestRateCandidates(formatted_interest_rates, true);

        var formatted_maturities = [];
        for (let i = 0; i < maturities.length; ++i) {
            formatted_maturities.push(Number(maturities[i]) * 86400);
        }

        logger.write("config.setMaturityCandidates: " + JSON.stringify(formatted_maturities) + "\n");
        await config.setMaturityCandidates(formatted_maturities, true);

        var minimum_issue_ratios = env.minimum_issue_ratios;
        var formatted_minimum_issue_ratios = [];
        for (let i = 0; i < minimum_issue_ratios.length; ++i) {
            let minimum_issue_ratio = BigNumber(minimum_issue_ratios[i]).multipliedBy(1e18).dividedBy(100).toFixed();
            formatted_minimum_issue_ratios.push(minimum_issue_ratio);
        }
        logger.write("config.setMinIssueRatioCandidates: " + JSON.stringify(formatted_minimum_issue_ratios) + "\n");
        await config.setMinIssueRatioCandidates(formatted_minimum_issue_ratios, true);

        var ratings = env.ratings;
        logger.write("config.setRatingCandidates: " + JSON.stringify(ratings) + "\n");
        await config.setRatingCandidates(ratings, true);

        var rating_weight_ratio_p = BigNumber(env.rating_weight_ratio.p).multipliedBy(1e18).dividedBy(100).toFixed();
        logger.write("config.setProfessionalRatingWeightRatio: " + rating_weight_ratio_p + "\n");
        await config.setProfessionalRatingWeightRatio(rating_weight_ratio_p);

        var rating_weight_ratio_c = BigNumber(env.rating_weight_ratio.c).multipliedBy(1e18).dividedBy(100).toFixed();
        logger.write("config.setCommunityRatingWeightRatio: " + rating_weight_ratio_c + "\n");
        await config.setCommunityRatingWeightRatio(rating_weight_ratio_c);

        var gov = env.gov;
        logger.write("config.setGov: " + gov + "\n");
        await config.setGov(env.gov.address);

        var gov_decimals = BigNumber(10).pow(gov.decimals);
        var community_rating_line = BigNumber(env.community_rating_line).multipliedBy(gov_decimals).toFixed();

        logger.write("config.setCommunityRatingLine: " + community_rating_line + "\n");
        await config.setCommunityRatingLine(community_rating_line);


        var ratingFeeRatio = env.ratingFeeRatio;
        ratingFeeRatio = BigNumber(ratingFeeRatio).multipliedBy(1e18).dividedBy(100).toFixed();
        await config.setRatingFeeRatio(ratingFeeRatio);

        var ACL_address = addresses['ACL'];
        var deployed_ACL = await ACL.at(ACL_address);
        var deployed_ACL_address = deployed_ACL.address;

        await deployed_ACL.enableany(addresses['BondFactory'], addresses['Router']);
        await deployed_ACL.enableany(addresses['BondFactory'], deployed_ACL_address);

        promises = [];
        for (let i = 0; i < env.oracle_admin.length; ++i) {
            logger.write("deployed_ACL.enableany: " + env.oracle_admin[i] + "Oracle.address" + addresses['Oracle'] + "\n");
            promises.push(deployed_ACL.enableany(env.oracle_admin[i], addresses['Oracle']));
        }

        var unlock_sig = web3.eth.abi.encodeFunctionSignature("unlock()");
        var lock_sig = web3.eth.abi.encodeFunctionSignature("lock()");

        for (let i = 0; i < env.stop_admin.length; ++i) {
            let _stop_admin = env.stop_admin[i];
            logger.write(util.format("deployed_ACL.enable(%s, %s, %s)", _stop_admin, deployed_ACL_address, unlock_sig) + "\n");
            promises.push(deployed_ACL.enable(_stop_admin, deployed_ACL_address, unlock_sig));
            logger.write(util.format("deployed_ACL.enable(%s, %s, %s)", _stop_admin, deployed_ACL_address, lock_sig) + "\n");
            promises.push(deployed_ACL.enable(_stop_admin, deployed_ACL_address, lock_sig));
        }

        var set_sig = web3.eth.abi.encodeFunctionSignature("set(address,bool)");
        for (let i = 0; i < env.pra_admin.length; ++i) {
            logger.write(util.format("deployed_ACL.enable(%s, %s, %s)" + env.pra_admin[i], addresses['PRA'], set_sig) + "\n");
            promises.push(deployed_ACL.enable(env.pra_admin[i], addresses['PRA'], set_sig));
        }

        await Promise.all(promises);
        logger.write("init finished");
        callback();
    } catch (error) {
        logger.write("error:" + error);
        callback(error);
    }
};
