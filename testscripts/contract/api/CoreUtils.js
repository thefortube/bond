'use strict';

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.isUnsafe = function(id) {
        return this.instance.methods.isUnsafe(id).call();
    }

    this.X = function(id) {
        return this.instance.methods.X(id).call();
    }
    this.Y = function(id) {
        return this.instance.methods.Y(id).call();
    }
    this.getLiquidateAmount = function(id, amount) {
        return this.instance.methods.getLiquidateAmount(id, amount).call();
    }
    this.address = function () {
        return this.instance.options.address
    }
}