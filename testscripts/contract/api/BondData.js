'use strict';
var web3 = require("web3");

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.vote = function (proposal, amount) {
        return this.sender.sendto(this.instance.methods.vote(proposal, amount), this.address());
    }
    this.id = function () {
        return this.instance.methods.id().call();
    }

    this.crowdToken = function () {
        return this.instance.methods.crowdToken().call();
    }

    this.invest = function (amount) {
        return this.sender.sendto(this.instance.methods.invest(amount), this.address());
    }

    this.profit = function () {
        return this.sender.sendto(this.instance.methods.profit(), this.address());
    }
    this.voteExpired = function () {
        return this.instance.methods.voteExpired().call();
    }
    this.investExpired = function() {
        return this.instance.methods.investExpired().call();
    }
    this.take = function () {
        return this.sender.sendto(this.instance.methods.take(), this.address());
    }
    this.txOutCrowd = function() {
        return this.sender.sendto(this.instance.methods.txOutCrowd(), this.address());
    }
    this.issuerStage = function() {
        return this.instance.methods.issuerStage().call();
    }
    this.bondStage = function() {
        return this.instance.methods.bondStage().call();
    }
    this.repay = function() {
        return this.sender.sendto(this.instance.methods.repay(), this.address());
    }
    this.liability = function() {
        return this.instance.methods.liability().call();
    }
    this.withdrawPawn = function() {
        return this.sender.sendto(this.instance.methods.withdrawPawn(), this.address());
    }
    this.withdrawPrincipalAndInterest = function() {
        return this.sender.sendto(this.instance.methods.withdrawPrincipalAndInterest(), this.address());
    }
    this.withdrawPrincipal = function() {
        return this.sender.sendto(this.instance.methods.withdrawPrincipal(), this.address());
    }
    this.setBondParam = function(param, expired) {
        return this.sender.sendto(this.instance.methods.setBondParam(web3.utils.asciiToHex(param), expired), this.address());
    }
    this.liquidate = function(amount) {
        return this.sender.sendto(this.instance.methods.liquidate(amount), this.address());
    }
    this.address = function () {
        return this.instance.options.address
    }
}
