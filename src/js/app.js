App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...");
    return App.initWeb3();
  },

  initWeb3: function(){
    if (typeof web3 !== 'undefined'){
      App.web3Provider = ethereum;
      web3 = new Web3(web3.currentProvider);
      ethereum.enable();
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function(){
    $.getJSON("EmeraldariumSale.json", function(emeraldariumSale){
      App.contracts.EmeraldariumSale = TruffleContract(emeraldariumSale);
      App.contracts.EmeraldariumSale.setProvider(App.web3Provider);
      App.contracts.EmeraldariumSale.deployed().then(function(emeraldariumSale){
        console.log("Emeraldarium Sale Address:", emeraldariumSale.address);
      });
    }).done(function(){
      $.getJSON("Emeraldarium.json", function(emeraldarium){
        App.contracts.Emeraldarium = TruffleContract(emeraldarium);
        App.contracts.Emeraldarium.setProvider(App.web3Provider);
        App.contracts.Emeraldarium.deployed().then(function(emeraldarium){
          console.log("Emeraldarium Address:", emeraldarium.address);
        });
        App.listenForEvents();
        return App.render();
      });
    });
  },

  render: function(){
    if (App.loading){
      return;
    }
    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();
    
    web3.eth.getCoinbase(function(err, account){
      if (err === null){
        App.account = account;
        $("#accountAddress").html("Your address is: " + account);
      }
    })
    App.contracts.EmeraldariumSale.deployed().then(function(instance){
      emeraldariumSaleInstance = instance;
      return emeraldariumSaleInstance.tokenPrice();
    }).then(function(tokenPrice){
      App.tokenPrice = tokenPrice;
      $(".token-price").html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return emeraldariumSaleInstance.tokensSold();
    }).then(function(tokensSold){
      App.tokensSold = tokensSold.toNumber();
      // App.tokensSold = 599900
      $(".tokens-sold").html(App.tokensSold);
      $(".tokens-available").html(App.tokensAvailable);

      var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
      $("#progress").css('width', progressPercent + '%');

      App.contracts.Emeraldarium.deployed().then(function(instance){
        emeraldariumInstance = instance;
        return emeraldariumInstance.balanceOf(App.account);
      }).then(function(balance){
        $('.emeraldarium-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      });
    });;
  },

  buyTokens: function(){
    $("#content").hide();
    $("#loader").show();

    var numberOfTokens = $("#numberOfTokens").val();
    App.contracts.EmeraldariumSale.deployed().then(function(instance){
      console.log("App account:", App.account);
      console.log("App tokenPrice:", App.tokenPrice);
      console.log("numberOfTokens:", numberOfTokens);
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000
      });
    }).then(function(result){
      console.log("tokens bought...");
      $("form").trigger('reset');
    })
  }, 

  listenForEvents: function() {
    App.contracts.EmeraldariumSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  }
}

$(function(){
  $(window).load(function(){
    App.init();
  }); 
});