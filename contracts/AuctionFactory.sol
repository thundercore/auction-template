pragma solidity ^0.5.17;

import { IERC20 } from '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol';
import { Initializable } from '@openzeppelin/upgrades/contracts/Initializable.sol';
import { Ownable } from '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import { SafeMath } from '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';

import { IAuctionFactory } from './interfaces/IAuctionFactory.sol';
import { IAuction } from './interfaces/IAuction.sol';

contract AuctionFactory is IAuctionFactory, Ownable {
    address private template;
    address private token;

    function createAuction(uint256 endTime, uint256 initialPrice, uint256 step, address payable _owner) external returns(address) {
        IAuction auction = cloneAuctionTemplate();
        auction.initialize(
            endTime,
            token,
            initialPrice,
            step,
            _owner
        );

        emit AUCTION_CREATED(address(auction), _owner, endTime, initialPrice, step);
        return address(auction);
    }

    function initialize() public {
        Ownable.initialize(msg.sender);
    }

    function setTemplate(address _template) public onlyOwner {
        template = _template;
    }

    function setTokenAddress(address _token) public onlyOwner {
        token = _token;
    }

    function cloneAuctionTemplate() internal returns (IAuction) {
        require(template != address(0), 'Contract is not yet initialized.');
        address payable auction = address(uint160(createClone(template)));
        return IAuction(auction);
    }

    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }
}
