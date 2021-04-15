module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 9545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    "thunder-testnet": {
      network_id: "18",
      gas: 3000000,
      gasPrice: 1000000000,
    },
    "thunder-mainnet": {
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
