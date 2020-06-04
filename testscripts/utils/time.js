var moment = require("moment");

module.exports = {
    now: function () {
        return Date.parse(new Date()) / 1000;
    },
    date: function (timestamp) {
        var _timestamp = timestamp * 1000;
        return moment(_timestamp).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
    }
}