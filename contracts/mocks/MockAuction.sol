pragma solidity ^0.5.17;

import '../Auction.sol';

contract MockAuction is Auction {
    uint256 private timestamp;

    function getTime() internal view returns(uint256) {
        return timestamp;
    }

    function setTime(uint256 to) public {
        timestamp = to;
    }
}
