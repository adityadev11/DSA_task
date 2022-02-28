const hre = require("hardhat");
//const Web3 = require("web3");
const { web3 } = require("hardhat");
const { ethers } = require("hardhat");
const DSA = require("dsa-connect");
const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.ethApiKey;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// const web3 = new Web3(
//   new Web3.providers.HttpProvider(
//     `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`
//   )
// );

const dsa = new DSA({
  web3: web3,
  mode: "node",
  privateKey: PRIVATE_KEY,
});

const my_address = "0x57A8C355790AEe45341f738C8Fb3a35475C86D51";

// network.provider.send("hardhat_setBalance", [
//   my_address,
//   ethers.utils.parseEther("10.0").toHexString(),
// ]);

async function getCurrentGasPrices() {
  let response = await axios.get(
    "https://ethgasstation.info/json/ethgasAPI.json"
  );
  let prices = {
    low: response.data.safeLow / 10,
    medium: response.data.average / 10,
    high: response.data.fast / 10,
  };
  console.log(`Current ETH Gas Prices (in GWEI):`);
  console.log(`Low: ${prices.low} (transaction completes in < 30 minutes)`);
  console.log(
    `Standard: ${prices.medium} (transaction completes in < 5 minutes)`
  );
  console.log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`);
  return prices;
}
async function Build() {
  await hre.network.provider.send("hardhat_setBalance", [
    my_address,
    ethers.utils.parseEther("10.0").toHexString(),
  ]);
  //console.log(web3.fromWei(web3.utils.eth.getBalance(my_address)));
  await web3.eth.getBalance(my_address, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(web3.utils.fromWei(result, "ether") + " ETH");
    }
  });
  const Prices = await getCurrentGasPrices();
  const Gas = Prices.high * 1000000000;
  console.log(Gas);
  await dsa
    .build({
      gasPrice: Gas, // estimated gas price
    })
    .then(console.log);
}

// async function Cast() {
//   const address = "0xB4Ee861482814c4Bb1c6a649aF77Bd78DbDBf59B";
//   await dsa.getAccounts(address).then(console.log);

//   let spells = await dsa.Spell();

//   await spells.add({
//     connector: "compound",
//     method: "deposit",
//     args: [
//       "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
//       "1000000000000000000", // 1 * 10^18 wei (1 Eth)
//       0,
//       0,
//     ],
//   });

//   await spells.cast().then(console.log);
// }

async function Execute() {
  await Build();
  //await Cast();
}
Execute().then(console.log("Done!"));
