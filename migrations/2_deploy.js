const AuctionV1 = artifacts.require('Auction')
const ERC20Token = artifacts.require('ERC20Token')
const Factory = artifacts.require('AuctionFactory')

module.exports = async function (deployer, network, [owner]) {
  switch (network) {
    case 'development':
      await Promise.all([
        deployer.deploy(AuctionV1),
        deployer.deploy(ERC20Token),
        deployer.deploy(Factory),
      ])

      const [auction, token, factory] = await Promise.all([
        AuctionV1.deployed(),
        ERC20Token.deployed(),
        Factory.deployed(),
      ])

      await factory.initialize()
      await factory.setTemplate(auction.address)
      await factory.setTokenAddress(token.address)

      break
    case 'thunder-testnet':
    case 'thunder-mainnet':
      // Deploy to Thunder networks
      break;
    default:
      throw new Error('Unsupported network')
  }
}
