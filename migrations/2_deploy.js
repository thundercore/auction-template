const AuctionV1 = artifacts.require('Auction')
const ERC20Token = artifacts.require('ERC20Token')
const Factory = artifacts.require('AuctionFactory')

module.exports = async function (deployer, network, [owner]) {
  await Promise.all([
    deployer.deploy(AuctionV1),
    deployer.deploy(Factory),
  ])

  const [auction, factory] = await Promise.all([
    AuctionV1.deployed(),
    Factory.deployed(),
  ])

  switch (network) {
    case 'development':
      await deployer.deploy(ERC20Token)
      const token = await ERC20Token.deployed()

      await factory.initialize()
      await factory.setTemplate(auction.address)
      await factory.setTokenAddress(token.address)

      break
    case 'thunder-testnet':
      await factory.initialize()
      await factory.setTemplate(auction.address)
      // TT-ETH address on ThunderCore Testnet
      await factory.setTokenAddress('0x6757D10620c46219aF1E2f0E23144682d1aDBCC2')
      break;
    case 'thunder-mainnet':
      await factory.initialize()
      await factory.setTemplate(auction.address)
      // TT-ETH address on ThunderCore Mainnet
      await factory.setTokenAddress('0x6576Bb918709906DcbFDCeae4bB1e6df7C8a1077')
      break;
    default:
      throw new Error('Unsupported network')
  }
}
