'use strict';

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.approve = function (who, amount) {
        return this.sender.sendto(this.instance.methods.approve(who, amount), this.address());
    }
    this.balanceOf = function (who) {
        return this.instance.methods.balanceOf(who).call();
    }
    this.decimals = function () {
        return this.instance.methods.decimals().call()
    }
    this.allowance = function(owner, spender) {
        return this.instance.methods.allowance(owner, spender).call();
    }
    this.symbol = function() {
        return this.instance.methods.symbol().call();
    }
    this.address = function () {
        return this.instance.options.address
    }
}