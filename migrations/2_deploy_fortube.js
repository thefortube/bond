var Router = artifacts.require("Router");
var Core = artifacts.require("Core");
var Vote = artifacts.require("Vote");
var Config = artifacts.require("Config");
var Oracle = artifacts.require("Oracle");
var Verify = artifacts.require("Verify");

var ACL = artifacts.require("ACL");
var BondFactory = artifacts.require("BondFactory");
var NameGen = artifacts.require("NameGen");
var PRA = artifacts.require("PRA");
var CoreUtils = artifacts.require("CoreUtils");

var BigNumber = require("bignumber.js");

var fs = require("fs");

var deployenv = require("../deployenv.json");

module.exports = async function(deployer, network) {
    network = /([a-z]+)(-fork)?/.exec(network)[1];
    var output = './deployed_' + network + ".json";
    if(fs.existsSync(output)) {
        fs.unlinkSync(output);
    }

    var gov = deployenv[network].gov;
    var pra_deposit_line = deployenv[network].pra_deposit_line;
    var owners = deployenv[network].owners;

    let gov_decimals = BigNumber(10).pow(gov.decimals);
    pra_deposit_line = BigNumber(pra_deposit_line).multipliedBy(gov_decimals).toFixed();

    await deployer.deploy(ACL, owners, owners.length);
    await deployer.deploy(PRA, ACL.address, gov.address, pra_deposit_line);
    await deployer.deploy(Router, ACL.address);
    await deployer.deploy(Oracle, ACL.address);
    await deployer.deploy(Config, ACL.address);
    await deployer.deploy(Verify, Config.address);
    await deployer.deploy(Vote, ACL.address, Router.address, Config.address, PRA.address);

    await deployer.deploy(NameGen);
    await deployer.deploy(CoreUtils, Router.address, Oracle.address);

    await deployer.deploy(Core, ACL.address, Router.address, Config.address, CoreUtils.address, Oracle.address, NameGen.address);
    await deployer.deploy(BondFactory, ACL.address, Router.address, Verify.address, Vote.address, Core.address, NameGen.address);
    
    var deployed = {
        BondFactory: BondFactory.address,
        Core: Core.address,
        Vote: Vote.address,
        Config: Config.address,
        Oracle: Oracle.address,
        ACL: ACL.address,
        PRA: PRA.address,
        Router: Router.address,
        CoreUtils: CoreUtils.address,
        NameGen: NameGen.address,
        Verify: Verify.address
    };

    fs.writeFileSync(output, JSON.stringify(deployed, null, 4));
};