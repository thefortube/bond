'use strict';

var Web3 = require("web3");
var path = require("path");

var Sender = require("../utils/sender.js");

function loader (network) {
    this.addresses = require(
        path.join(__dirname, '/addresses/', network + '.json')
    );

    var networks = require("./networks/index.js");

    this.web3 = new Web3(
        new Web3.providers.HttpProvider(networks[network].provider())
    );
}

loader.prototype.checkout_sender = function(pk) {
    this.sender = new Sender(this.web3, pk);
}

loader.prototype.load = function (name) {
    var address = this.addresses[name];
    if (!address) {
        throw new Error('not found address by name: ', name);
    }
    return this.at(name, address);
}

loader.prototype.at = function (name, address) {
    if(address === "0x0000000000000000000000000000000000000000") {
        name = "WETH";
    }
    var abi = require(path.join(__dirname, '/abi/', name + '.json'));
    if (!abi) {
        throw new Error('not found abi by name: ' + name);
    }

    var api = require(path.join(__dirname, '/api/', name + '.js'));
    if (!api) {
        throw new Error('not found api by name: ' + name);
    }
    return new api(
        new this.web3.eth.Contract(abi, address),
        this.sender
    );
}


module.exports = loader;