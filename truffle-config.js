const HDWalletProvider = require('truffle-hdwallet-provider'); // eslint-disable-line
const path = require('path');

const sources = path.join(process.cwd(), 'contracts');

module.exports = {
  compilers: {
    solc: {
      version: '0.6.0',
      parser: 'solcjs',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        //evmVersion: 'byzantium',
        evmVersion: 'istanbul',
      },
    },
  },
  contracts_directory: sources,
  networks: {
    mainnet: {
      network_id: '1',
      provider: () => new HDWalletProvider(
        process.env.DEPLOYER_PRIVATE_KEY,
        process.env.DEPLOYER_MAINNET_INFURA_URL
      ),
      gasPrice: 30000000000,
      gas: 9500000,
      timeoutBlocks: 500,
    },
    rinkeby: {
      network_id: '4',
      provider: () => new HDWalletProvider(
        process.env.DEPLOYER_PRIVATE_KEY,
        process.env.DEPLOYER_RINKEBY_INFURA_URL
      ),
      gasPrice: 10000000000, // 10 gwei
      gas: 9500000,
      timeoutBlocks: 500,
    },
    ropsten: {
      network_id: '3',
      provider: () => new HDWalletProvider(
        process.env.DEPLOYER_PRIVATE_KEY,
        process.env.DEPLOYER_ROPSTEN_INFURA_URL
      ),
      gasPrice: 10000000000, // 10 gwei
      gas: 7500000,
      timeoutBlocks: 500,
    },
  },
};
