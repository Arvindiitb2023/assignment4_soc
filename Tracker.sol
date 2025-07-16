// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tracker {
    struct Item {
        uint256 id;
        string name;
        address owner;
    }

    mapping(uint256 => Item) public items;
    uint256 public itemCounter;

    event ItemRegistered(uint256 indexed id, address indexed owner, string name);
    event OwnershipTransferred(uint256 indexed id, address indexed from, address indexed to);

    function registerItem(string memory name) public {
        itemCounter++;
        items[itemCounter] = Item(itemCounter, name, msg.sender);
        emit ItemRegistered(itemCounter, msg.sender, name);
    }

    function transferOwnership(uint256 id, address newOwner) public {
        require(items[id].owner == msg.sender, "Only the current owner can transfer.");
        address previousOwner = items[id].owner;
        items[id].owner = newOwner;
        emit OwnershipTransferred(id, previousOwner, newOwner);
    }
}
