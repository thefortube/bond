'use strict';

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.depositMultiple = function(token) {
        return this.instance.methods.depositMultiple(token).call();
    }
    
    this.address = function () {
        return this.instance.options.address
    }
}