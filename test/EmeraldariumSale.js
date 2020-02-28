var EmeraldariumSale = artifacts.require("./EmeraldariumSale.sol");
var Emeraldarium = artifacts.require("./Emeraldarium.sol");

contract('EmeraldariumSale', function(accounts) {
  var tokenSaleInstance;
  var buyer = accounts[1];
  var admin = accounts[0];
  var tokenPrice = 1000000000000000;
  var tokensAvailable = 750000;
  var numberOfTokens = 10;

  it('initializes the contract with the correct values', function(){
    return EmeraldariumSale.deployed().then(function(instance){
      tokenSaleInstance = instance;
      return tokenSaleInstance.address;
    }).then(function(address){
      assert.notEqual(address, "0x0", 'has contract address');
      return tokenSaleInstance.tokenContract();
    }).then(function(address){
      assert.notEqual(address, "0x0", 'has token contract address');
      return tokenSaleInstance.tokenPrice();
    }).then(function(price){
      assert.equal(price, tokenPrice, 'token price is correct');
    });
  });

  it('facilitates token buying', function(){
    return Emeraldarium.deployed().then(function(instance){
      tokenInstance = instance;
      return EmeraldariumSale.deployed();
    }).then(function(instance){
      tokenSaleInstance = instance;
      return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
    }).then(function(receipt){
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice});
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
      return tokenSaleInstance.tokensSold();
    }).then(function(amount){
      assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
      return tokenInstance.balanceOf(buyer);
    }).then(function(balance){
      assert.equal(balance.toNumber(), numberOfTokens, 'increments the number of tokens on the buyer account');
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance){
      assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, 'decreases the tokens available');
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 })
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
      return tokenSaleInstance.buyTokens(800000, { from: buyer, value: 1 })
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
    });
  });

  it('ends token sale', function(){return Emeraldarium.deployed().then(function(instance){
    tokenInstance = instance;
    return EmeraldariumSale.deployed();
    }).then(function(instance){
      tokenSaleInstance = instance;
      return tokenSaleInstance.endSale({ from: buyer });
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 0, 'can only be ended by admin');
      return tokenSaleInstance.endSale({ from: admin });
    }).then(function(receipt){
      return tokenInstance.balanceOf(admin);
    }).then(function(balance){
      assert.equal(balance.toNumber(), 999990, 'returns all unsold Emeraldarium to admin');
      return web3.eth.getBalance(tokenSaleInstance.address);
    }).then(function(balance){
      assert.equal(balance, 0, 'transfers the balance to the admin');
    });
  });

})