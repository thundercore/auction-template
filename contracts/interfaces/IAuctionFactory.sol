pragma solidity ^0.5.17;

interface IAuctionFactory {
    event AUCTION_CREATED(address indexed auction, address owner, uint256 endTime, uint256 initialPrice, uint256 step);

    function createAuction(uint256 endTime, uint256 initialPrice, uint256 step, address payable owner) external returns(address);
}
