'use strict';

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.lock = function () {
        return this.sender.sendto(this.instance.methods.lock(), this.address());
    },
    this.set = function (who, enable) {
        return this.sender.sendto(this.instance.methods.set(who, enable), this.address());
    }
    this.raters = function(who) {
        return this.instance.methods.raters(who).call();
    }
    this.unlock = function() {
        return this.sender.sendto(this.instance.methods.unlock(), this.address());
    }
    this.address = function () {
        return this.instance.options.address
    }
}