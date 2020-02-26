pragma solidity ^0.4.2;

contract Emeraldarium {
  string public name = "Emeraldarium";
  string public standard = "Emeraldarium v1.0";
  string public symbol = "EMD";

  uint256 public totalSupply;

  mapping(address => uint256) public balanceOf;

  constructor(uint256 _initialSupply) public {
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
  }
}