module.export = {
    rinkeby: {
        network: "4",
        provider: () => {
            return process.env.DEPLOYER_RINKEBY_INFURA_URL
        }
    },
    ropsten: {
        network: "3",
        provider: () => {
            return process.env.DEPLOYER_ROPSTEN_INFURA_URL
        }
    }
}
