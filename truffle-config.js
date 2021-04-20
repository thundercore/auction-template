const HDWalletProvider = require("@truffle/hdwallet-provider");

const privateKeys = Object.entries(process.env)
  .filter(([key]) => key.startsWith('KEY'))
  .map(([, secret]) => secret)

const useProvider = (url) => () => {
  if (!privateKeys.length) {
    throw new Error('Require private keys to initialize provider')
  }

  return new HDWalletProvider(
    privateKeys,
    url,
    0,
    privateKeys.length
  )
}

module.exports = {
  plugins: ["truffle-plugin-save-per-network-deployment-record"],
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 9545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    "thunder-testnet": {
      provider: useProvider('https://testnet-rpc.thundercore.com'),
      network_id: "18",
      gas: 3000000,
      gasPrice: 1000000000,
    },
    "thunder-mainnet": {
      provider: useProvider('https://mainnet-rpc.thundercore.com'),
      network_id: "108",
      gas: 3000000,
      gasPrice: 1000000000,
    },
  },
  compilers: {
    solc: {
      version: "0.5.17",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "byzantium",
      },
    },
  },
};
