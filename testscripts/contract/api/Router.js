'use strict';

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.bondNr = function () {
        return this.instance.methods.bondNr().call();
    }
    this.routerDataMap = async function(id) {
        return this.instance.methods.routerDataMap(id).call();
    }
    this.address = function () {
        return this.instance.options.address
    }
}