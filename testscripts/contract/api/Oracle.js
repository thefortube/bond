'use strict';

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.getPrice = function (token) {
        return this.instance.methods.getPrice(token).call();
    }
    this.set = function (token, price, exp) {
        return this.sender.sendto(this.instance.methods.set(token, price, exp), this.address());
    }

    this.address = function () {
        return this.instance.options.address
    }
}