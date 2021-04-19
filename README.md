## Example Contract for Running Auctions on ThunderCore Blockchain

A simple implementation of auction contract. Users can create their own auction, setting end time, initial price, and minimum bidding price increment.

### Usage

1. Download or fork this repository.

2. Install Node.js dependencies, please note that minimum Node.js version requirement is v12.

  ```bash
  # Yarn is Node.js package manager tool. See install instruction here: https://yarnpkg.com/getting-started/install
  $ yarn
  ...
  [1/5] Validating package.json...
  [2/5] Resolving packages...
  [3/5] Fetching packages...
  ...
  [5/5] Building fresh packages...
  ...
  ```

3. Compile contract ABI

  ```bash
  $ yarn build
  ...
  Compiling your contracts...
  ===========================
  > Compiling ./contracts/Auction.sol
  ...
  ```

  Compiled JSON files should be under `build/contracts/` folder.

4. Deployment

  The example deploy script is under `migrations` folder, which is only available for your local development chain.

  If you want to deploy to ThunderCore mainnet or testnet, you will need:

    1. Edit Truffle configuation file `truffle-config.js`. Set up your own private keys in network provider.

    2. Find the address of the token you want to receive (or deploy your own token).

    3. Follow the migration script but replace the token address.

    4. Run migration with specific network option:

      ```bash
      $ yarn migrate --network thunder-testnet
      ```

### [Interfaces](https://github.com/thundercore/auction-template/tree/abi)

- [IAuctionFactory](https://thundercore.github.io/auction-template/IAuctionFactory.json)
- [IAuction](https://thundercore.github.io/auction-template/IAuction.json)
