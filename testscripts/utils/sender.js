var logger = require("./logger.js");

function Sender (web3, pk) {
    this.pk = pk;
    this.web3 = web3;
    this.account = web3.eth.accounts.privateKeyToAccount(pk);
}

Sender.prototype.address = function() {
    return this.account.address;
}

Sender.prototype.sendto = async function (method, to, value) {
    var data = method.encodeABI();
    logger.info("sender.send/data: " + data);
    logger.info("sender.send/account.address: ", this.account.address);
    //var gas = await method.estimateGas({ from: account.address });
    var gasLimit = 6000000;
    logger.info("sender.send/gasLimit: " + gasLimit);

    var gasPrice = await this.web3.eth.getGasPrice();
    gasPrice = Math.max(Math.min(gasPrice || 4 * 1e9, 20 * 1e9), 4 * 1e9);
    logger.info("sender.send/gasPrice: " + gasPrice);
    var balance = await this.web3.eth.getBalance(this.account.address);
    logger.info("sender.send/balance: " + balance);
    logger.info("sender.send/to: " + to);

    const stx = await this.web3.eth.accounts.signTransaction({
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        to: to,
        value: value || '0x00',
        data: data,
    }, this.account.privateKey);

    logger.info("sender.send/stx.transactionHash: " + stx.transactionHash);

    return new Promise((resolve, reject) => {
        this.web3.eth.sendSignedTransaction(stx.rawTransaction).then(function (receipt) {
            resolve(receipt);
        }).catch(function (error) {
            logger.error("sender.send/web3.eth.sendSignedTransaction.catch/error: " + error);
            reject(error);
        });
    });
}

module.exports = Sender;