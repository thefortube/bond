'use strict';

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.interestBearingPeriod = function(id) {
        return this.sender.sendto(this.instance.methods.interestBearingPeriod(id), this.address());
    }

    this.address = function () {
        return this.instance.options.address
    }
}