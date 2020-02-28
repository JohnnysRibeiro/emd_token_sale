const Emeraldarium = artifacts.require("Emeraldarium");
const EmeraldariumSale = artifacts.require("EmeraldariumSale");

module.exports = function(deployer) {
  deployer.deploy(Emeraldarium, 1000000).then(function(){
    // 0,001 ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(EmeraldariumSale, Emeraldarium.address, tokenPrice);
  });
};
