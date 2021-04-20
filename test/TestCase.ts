const AuctionFactory = artifacts.require('AuctionFactory')
const IAuction = artifacts.require('IAuction')
const Token = artifacts.require('ERC20Token')
const Auction = artifacts.require('Auction')

contract('Auction Test Suite', async function ([owner, ...users]) {
  const createInstances = async () => {
    const [factory, template, token] = await Promise.all([
      AuctionFactory.new(),
      Auction.new(),
      Token.new(),
    ])

    await token.initialize(
      'Fake Token',
      'FT',
      18,
      '1000000000000',
      owner,
      [],
      [],
    )

    await Promise.all(users.map(user => token.transfer(user, '10000')))

    await factory.initialize()
    await factory.setTemplate(template.address)
    await factory.setTokenAddress(token.address)
    return [factory, token]
  }

  it('interaction with truffle API', async () => {
    const [factory, token] = await createInstances()

    const { logs } = await factory.createAuction(
      `${ Math.floor(Date.now() / 1000) + 10 }`,
      `${ 1000 }`,
      `${ 100 }`,
      owner,
    )

    const { args: { auction: auctionAddress } } = logs.find(log => log.event === 'AUCTION_CREATED')

    const auction = await IAuction.at(auctionAddress)

    // User have to approve "Auction" contract to transfer their own asset before bidding
    await Promise.all(users.map(from => token.approve(auctionAddress, '10000', { from })))

    await auction.bid(0, { from: users[0] })
    await auction.bid(0, { from: users[1] })
    await auction.bid(0, { from: users[0] })
    await auction.stop({ from: owner })
    await auction.withdraw({ from: owner })
  })
})
