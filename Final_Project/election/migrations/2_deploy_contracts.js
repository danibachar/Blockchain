var Election = artifacts.require("./Election.sol");
var BibiCoin = artifacts.require("./BibiCoin.sol");

// module.exports = function(deployer) {
//   deployer.deploy(Election)
//     .then(function(){
//       return deployer
//         .deploy(BibiCoin, Election.address, 626)
//     });
// };
//
//
//
//
module.exports = function(deployer) {
  deployer.deploy(Election);
};
