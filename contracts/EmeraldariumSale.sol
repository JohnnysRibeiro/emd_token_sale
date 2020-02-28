pragma solidity ^0.4.2;

import "./Emeraldarium.sol";

contract EmeraldariumSale {
  address admin;
  Emeraldarium public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  event Sell(
    address _buyer,
    uint256 _amount
  );

  constructor(Emeraldarium _tokenContract, uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }

  function multiply(uint256 x, uint256 y) internal pure returns (uint256 z){
    require(y == 0 || (z = x * y) / y == x, 'Does the math');
  }

  function buyTokens(uint256 _numberOfTokens) public payable {
    require(msg.value == multiply(_numberOfTokens, tokenPrice), 'Value must be equal to number of tokens * price');
    require(tokenContract.balanceOf(this) >= _numberOfTokens, 'Number of tokens must be less than or equal to available');
    require(tokenContract.transfer(msg.sender, _numberOfTokens), 'Must transfer the tokens correctly');

    tokensSold += _numberOfTokens;

    emit Sell(msg.sender, _numberOfTokens);
  }

  function endSale() public {
    require(msg.sender == admin, 'Can only be ended by admin');
    require(tokenContract.transfer(admin, tokenContract.balanceOf(this)), 'Must transfer the remaining tokens to admin correctly');
    admin.transfer(address(this).balance);
  }
}
