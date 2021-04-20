pragma solidity ^0.5.17;

import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';

import './interfaces/IAuction.sol';

contract Auction is IAuction, Initializable, Ownable {
    using SafeMath for uint256;

    address private bidder;
    uint256 private price;
    uint256 private step;
    uint256 private endTime;
    bool private closed;
    IERC20 private coin;

    function initialize(
        uint256 _endTime,
        address _coin,
        uint256 basePrice,
        uint256 _step,
        address payable _owner
    ) external initializer {
        Ownable.initialize(_owner);

        price = basePrice;
        step = _step;
        endTime = _endTime;
        coin = IERC20(_coin);
    }

    function currentBidder() external view returns (address) {
        return bidder;
    }

    /** @notice Current bidding price, scaled by 1e18 */
    function currentPrice() external view returns (uint256) {
        return price;
    }

    /**
     * @dev Every bidding increase by the "step" value. Users might bid over the price they saw in the UI.
     * @dev Set the maxValue to 0 presents no price limit restriction.
     */
    function bid(uint256 maxValue) external returns (uint256 actualBidPrice) {
        require(!isClosed(), 'The auction is closed');
        require(bidder != msg.sender, 'Current highest bid is from the same account');

        uint256 newPrice = bidder == address(0) ? price : price.add(step);
        require(maxValue == 0 || maxValue >= newPrice, 'Current bidding price exceed allowance');

        uint256 lastPrice = price;
        address lastBidder = bidder;
        price = newPrice;
        bidder = msg.sender;

        coin.transferFrom(msg.sender, address(this), newPrice);
        returnLastBid(lastBidder, lastPrice);

        emit NEW_BID(msg.sender, lastBidder, newPrice, lastPrice);


        return newPrice;
    }

    function remainTime() public view returns (uint256 remainSeconds) {
        return getTime() >= endTime ? 0 : endTime.sub(getTime());
    }

    function isClosed() public view returns (bool) {
        return closed || remainTime() == 0;
    }

    //// ADMIN functions

    /** @notice Cancel the auction, contract-holded TT-ETH will return to the last bidder. */
    function cancel() external onlyOwner returns (bool) {
        require(!isClosed(), 'Unable to cancel a closed auction');
        returnLastBid(bidder, price);

        bidder = address(0);
        closed = true;
        emit AUCTION_CANCELED(getTime());
        return true;
    }

    /** @notice Force the auction stop. */
    function stop() external onlyOwner returns (bool) {
        require(!isClosed(), 'The auction is already closed');

        closed = true;
        emit AUCTION_STOPPED(getTime());
        return true;
    }

    /** @notice Owner claim TT-ETH after auction stopped.  */
    function withdraw() external onlyOwner returns (bool) {
        require(isClosed(), 'Owner can only withdraw assets after auction is closed');
        require(bidder != address(0), 'No biddings to the auction');

        coin.transfer(msg.sender, price);
        emit WITHDRAWED(msg.sender, price);
        return true;
    }

    //// Internal functions

    function returnLastBid(address lastBidder, uint256 lastPrice) internal {
        if (lastBidder != address(0)) {
            coin.transfer(lastBidder, lastPrice);
            emit BID_RETURNED(lastBidder, lastPrice);
        }
    }

    function getTime() internal view returns (uint256) {
        return block.timestamp;
    }
}
