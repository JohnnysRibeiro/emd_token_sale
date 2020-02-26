const Emeraldarium = artifacts.require("Emeraldarium");

module.exports = function(deployer) {
  deployer.deploy(Emeraldarium, 1000000);
};
