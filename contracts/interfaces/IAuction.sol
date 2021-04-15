pragma solidity ^0.5.17;

interface IAuction {
    event AUCTION_CANCELED(uint256 timestamp);
    event AUCTION_STOPPED(uint256 timestamp);

    event NEW_BID(address indexed newBidder, address indexed prevBidder, uint256 newPrice, uint256 prevPrice);
    event BID_RETURNED(address indexed returnTo, uint256 amount);

    function currentBidder() external view returns(address);
    /** @notice Current bidding price, scaled by 1e18 */
    function currentPrice() external view returns(uint256);

    /**
     * @dev Every bidding increase by the "step" value. Users might bid over the price they saw in the UI.
     * @dev Set the maxValue to 0 presents no price limit restriction.
     */
    function bid(uint256 maxValue) external returns(uint256 actualBidPrice);

    function remainTime() external view returns(uint256 remainSeconds);

    function owner() external view returns (address);

    //// ADMIN functions

    /** @notice Cancel the auction, contract-holded TT-ETH will return to the last bidder. */
    function cancel() external returns(bool);
    /** @notice Force the auction stop. */
    function stop() external returns(bool);
    /** @notice Owner claim TT-ETH after auction stopped.  */
    function withdraw() external returns(bool);

    function transferOwnership(address newOwner) external;
}
