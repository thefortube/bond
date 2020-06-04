var Rating = artifacts.require("Rating");
var fs = require('fs');

//rm -rf build/
//truffle compile
//truffle exec ./migrations/deploy_ratings.js --network ropsten

var ratings = [
    { "name": "A-1", "risk": 0, "fine": true },
    { "name": "A-2", "risk": 1, "fine": true },
    { "name": "A-3", "risk": 2, "fine": true },
    { "name": "B", "risk": 3, "fine": true },
    { "name": "C", "risk": 4, "fine": true },
    { "name": "D", "risk": 5, "fine": false }
]

module.exports = async function (callback) {
    try {
        var network = await web3.eth.net.getNetworkType();
        var output = "./deployed_ratings_" + network + ".json"

        if (fs.existsSync(output)) {
            console.log("Warring: address is not update because the deployed file exists");
            return callback();
        }

        var promise = [];
        for (let i = 0; i < ratings.length; ++i) {
            promise.push(new Promise((resolve, reject) => {
                Rating.new(ratings[i].name, ratings[i].risk, ratings[i].fine).then(function (deployed) {
                    resolve(deployed.address);
                }).catch(function (error) {
                    reject(error);
                });
            }));
        }

        var deployed_ratings = await Promise.all(promise);
        fs.writeFileSync(output, JSON.stringify(deployed_ratings, null, 4));
        callback();
    } catch (e) {
        callback(e);
    }
}

