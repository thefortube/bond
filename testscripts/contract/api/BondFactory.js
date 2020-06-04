
module.exports = function (instance, sender) {
    this.instance = instance;
    this.sender = sender;

    //@deposit_token 质押代币(address)
    //@issue_token 融资代币(address)
    //@issue_amount 融资数量
    //@interest_rate 年化利率
    //@duration 债券期限
    //@issue_fee 发行费用
    //@minimux_issue_ratio 最小融资比率

    this.issue = function (token, minimux_deposit_amount, basic, flags) {
        let value = '0x00';
        if(token[0] === "0x0000000000000000000000000000000000000000") {
            value = minimux_deposit_amount;
        }

        return this.sender.sendto(
            this.instance.methods.issue(
                token, minimux_deposit_amount, basic, flags),
            this.address(), value);
    }

    this.address = function () {
        return this.instance.options.address
    }
}
