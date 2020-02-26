var Emeraldarium = artifacts.require("./Emeraldarium.sol");

contract('Emeraldarium', function(accounts) {

  it('initializes the contract with the correct values', function(){
    return Emeraldarium.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.name();
    }).then(function(name){
      assert.equal(name, "Emeraldarium", 'has the correct name');
      return tokenInstance.symbol();
    }).then(function(symbol){
      assert.equal(symbol, "EMD", 'has the correct symbol');
      return tokenInstance.standard();
    }).then(function(standard){
      assert.equal(standard, "Emeraldarium v1.0", "has the correct standard");
    });
  })

  it('sets the total supply upon deployment', function() {
    return Emeraldarium.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.totalSupply();
    }).then(function(totalSupply) {
      assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(adminBalance){
      assert.equal(adminBalance.toNumber(), 1000000, 'it allocate the inital supply to the admin account');
    });
  });

})