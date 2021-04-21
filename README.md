## Example Contract for Running Auctions on ThunderCore Blockchain

A simple implementation of auction contract. Users can create their own auction, setting end time, initial price, and minimum bidding price increment.

### :zap: Usage

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

    1. An account and its private key of ThunderCore chain with enough gas(TT) to deploy.

    2. Replace the token address in `migrations/2_deploy.js` if require.

    3. Run migration with specific network option:

        ```bash
        $ PRIVATE_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        $ KEY=$PRIVATE_KEY yarn migrate --network thunder-testnet
        ...
            Deploying 'AuctionFactory'
            --------------------------
            > transaction hash:    ...
            > Blocks: 0            ...
            > contract address:    0x1111111111111111111111111111111111111111
            ...
        ```

5. Interaction with the contract

    - For web front-end, you can reference the [web3 test case](https://github.com/thundercore/auction-template/blob/master/test/TestCase.ts#L12-L59).

    - For truffle console, please check the [truffle test case](https://github.com/thundercore/auction-template/blob/master/test/TestCase.ts#L61-L80).


### :zap: [Interfaces](https://github.com/thundercore/auction-template/tree/abi)

- [IAuctionFactory](https://thundercore.github.io/auction-template/IAuctionFactory.json)
- [IAuction](https://thundercore.github.io/auction-template/IAuction.json)

### :zap: Implementations

- [AuctionFactory](https://thundercore.github.io/auction-template/AuctionFactory.json)
- [Auction](https://thundercore.github.io/auction-template/Auction.json)
