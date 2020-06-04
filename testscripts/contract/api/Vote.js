'use strict';

module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.prcast = function(id, proposal, reason) {
        return this.sender.sendto(this.instance.methods.prcast(id, proposal, reason), this.address());
    }
    this.rating = function(id) {
        return this.sender.sendto(this.instance.methods.rating(id), this.address());
    }

    this.address = function () {
        return this.instance.options.address
    }
}