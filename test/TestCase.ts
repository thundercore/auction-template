const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const Auction = artifacts.require('Auction')
const AuctionFactory = artifacts.require('AuctionFactory')
const IAuction = artifacts.require('IAuction')
const MockAuction = artifacts.require('MockAuction')
const Token = artifacts.require('ERC20Token')

contract('Auction Test Suite', async function ([owner, ...users]) {
  it('interaction with Truffle API', async () => {
    const [factory, token] = await createInstances()

    const auction = await createAuctionByFactory(
      factory,
      `${ Math.floor(Date.now() / 1000) + 10 }`,
      `${ 1000 }`,
      `${ 100 }`,
      owner,
    )

    // User have to approve "Auction" contract to transfer their own asset before bidding
    await Promise.all(users.map(from => token.approve(auction.address, '10000', { from })))

    await auction.bid(0, { from: users[0] })
    await auction.bid(0, { from: users[1] })
    await auction.bid(0, { from: users[0] })
    await auction.stop({ from: owner })
    await auction.withdraw({ from: owner })
  })

  describe('Factory Behaviors', () => {
    it('supports to set different auction templates', async () => {
      const [factory] = await createInstances()
      const mockAuction = await MockAuction.at(
        (await createAuctionByFactory(factory, '1', '2', '3', owner)).address
      )

      await mockAuction.setTime('999')

      // Set template to Auction (without method: setTime)
      const auction = await Auction.new()
      await factory.setTemplate(auction.address)
      const auctionWithoutSetTime = await MockAuction.at(
        (await createAuctionByFactory(factory, '1', '2', '3', owner)).address
      )

      await expectRevert.unspecified(
        auctionWithoutSetTime.setTime('999')
      )

      // Set template to MockAuction (with method: setTime)
      const newMockedAuction = await MockAuction.new()
      await factory.setTemplate(newMockedAuction.address)
      const auction3 = await MockAuction.at(
        (await createAuctionByFactory(factory, '1', '2', '3', owner)).address
      )

      await auction3.setTime('999')
    })

    it('supports to set different tokens', async () => {
      const newToken = await Token.new()
      await newToken.initialize(
        'New Fake Token',
        'NFT',
        6,
        '10000',
        users[1],
        [],
        [],
      )
      const [factory] = await createInstances()
      await factory.setTokenAddress(newToken.address)
      const auction = await createAuctionByFactory(factory, '100', '1000', '1', owner)
      await newToken.approve(auction.address, '1000', { from: users[1] })
      await auction.bid('1000', { from: users[1] })

      expect(await newToken.balanceOf(auction.address)).to.be.bignumber.eq('1000')
    })
  })

  describe('Auction Behaviors', () => {
    let factory
    let token
    let auction
    let bid
    const auctionOwner = users[0]
    const endTime = 100
    beforeEach(async () => {
      [factory, token] = await createInstances()
      auction = await MockAuction.at(
        (
          await createAuctionByFactory(
            factory,
            `${endTime}`,
            '1000',
            '10',
            auctionOwner
          )
        ).address
      )
      bid = async (account, approve = '1000', maxValue = '0') => {
        await token.approve(auction.address, approve, { from: account })
        return await auction.bid(maxValue, { from: account })
      }
    })
    it('normally ends after time exceed end-time', async () => {
      await auction.setTime(`${endTime - 20}`)
      const recipient1 = await bid(users[1], '1000')
      expectEvent(recipient1, 'NEW_BID', { newBidder: users[1], newPrice: '1000' })

      await auction.setTime(`${endTime - 10}`)
      const recipient2 = await bid(users[2], '1010')
      expectEvent(recipient2, 'NEW_BID', { newBidder: users[2], newPrice: '1010' })
      expectEvent(recipient2, 'BID_RETURNED', { returnTo: users[1], amount: '1000' })

      await auction.setTime(`${endTime}`)
      await expectRevert(
        bid(users[3], '1020'),
        'The auction is closed'
      )

      expectEvent(
        await auction.withdraw({ from: auctionOwner }),
        'WITHDRAWED',
        { amount: '1010' }
      )
    })
    it('can be stopped earlier by the owner', async () => {
      await auction.setTime(`${endTime - 20}`)
      const recipient1 = await bid(users[1], '1000')
      expectEvent(recipient1, 'NEW_BID', { newBidder: users[1], newPrice: '1000' })

      await auction.setTime(`${endTime - 10}`)
      await expectRevert(
        auction.stop({ from: users[1] }),
        'Ownable: caller is not the owner'
      )

      expectEvent(
        await auction.stop({ from: auctionOwner }),
        'AUCTION_STOPPED',
        { timestamp: `${endTime - 10}` }
      )

      expectEvent(
        await auction.withdraw({ from: auctionOwner }),
        'WITHDRAWED',
        { amount: '1000' }
      )
    })
    it('can be canceled by the owner', async () => {
      await auction.setTime(`${endTime - 20}`)
      const recipient1 = await bid(users[1], '1000')
      expectEvent(recipient1, 'NEW_BID', { newBidder: users[1], newPrice: '1000' })

      await auction.setTime(`${endTime - 10}`)
      await expectRevert(
        auction.cancel({ from: users[1] }),
        'Ownable: caller is not the owner'
      )

      expectEvent(
        await auction.cancel({ from: auctionOwner }),
        'AUCTION_CANCELED',
        { timestamp: `${endTime - 10}` }
      )

      await expectRevert(
        auction.withdraw({ from: auctionOwner }),
        'No biddings to the auction'
      )
    })
    it('common failures', async () => {
      expectEvent(
        await bid(users[1], '1000'),
        'NEW_BID',
        { newBidder: users[1], newPrice: '1000' }
      )
      await auction.setTime(`${endTime - 10}`)

      await expectRevert(
        bid(users[2], '1000'),
        'ERC20: transfer amount exceeds allowance'
      )

      await expectRevert(
        bid(users[3], '1000', '1000'),
        'Current bidding price exceed allowance'
      )

      expectEvent(
        await bid(users[4], '1010'),
        'NEW_BID',
        { newBidder: users[4], newPrice: '1010' }
      )

      await expectRevert(
        auction.withdraw({ from: auctionOwner }),
        'Owner can only withdraw assets after auction is closed'
      )

      await auction.setTime(`${endTime + 10}`)

      await expectRevert(
        bid(users[5], '1020'),
        'The auction is closed'
      )

      await expectRevert(
        auction.cancel({ from: auctionOwner }),
        'Unable to cancel a closed auction'
      )

      await expectRevert(
        auction.stop({ from: auctionOwner }),
        'The auction is already closed'
      )

      expectEvent(
        await auction.withdraw({ from: auctionOwner }),
        'WITHDRAWED',
        { amount: '1010' }
      )
    })
    it('if no one bid to the auction', async () => {
      await auction.setTime(`${endTime}`)
      await expectRevert(
        auction.withdraw({ from: auctionOwner }),
        'No biddings to the auction'
      )
    })
  })

  async function createInstances() {
    const [factory, template, token] = await Promise.all([
      AuctionFactory.new(),
      MockAuction.new(),
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

  async function createAuctionByFactory(factory, ...params) {
    const { logs } = await factory.createAuction(...params)
    const { args: { auction: auctionAddress } } = logs.find(
      log => log.event === 'AUCTION_CREATED'
    )

    return await IAuction.at(auctionAddress)
  }
})
