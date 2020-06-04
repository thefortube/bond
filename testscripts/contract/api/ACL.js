module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    this.enableany = function (who, to) {
        return this.sender.sendto(
            this.instance.methods.enableany(who, to), this.address());
    }

    this.address = function () {
        return this.instance.options.address
    }
}
