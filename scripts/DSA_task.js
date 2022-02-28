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
    ethers.utils.parseEther("18.0").toHexString(),
  ]);
  await web3.eth.getBalance(my_address, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(web3.utils.fromWei(result, "ether") + " ETH");
    }
  });
  const Prices = await getCurrentGasPrices();
  const Gas = (Prices.high + 5) * 1000000000;
  console.log(Gas);
  await dsa
    .build({
      gasPrice: Gas, // estimated gas price
      version: 2,
    })
    .then(console.log);
}

async function Cast() {
  var myAccounts = await dsa.getAccounts(my_address).then(console.log());
  var newAccountId = myAccounts[0]["id"];
  var newAccountAddress = myAccounts[0]["address"];
  console.log("Addr--", newAccountAddress);
  console.log(myAccounts, newAccountId);

  await dsa.setInstance(myAccounts[0]["id"]);

  const Prices = await getCurrentGasPrices();
  const Gas = (Prices.high + 5) * 1000000000;
  console.log(Gas);

  await hre.network.provider.send("hardhat_setBalance", [
    newAccountAddress,
    ethers.utils.parseEther("15.0").toHexString(),
  ]);

  await web3.eth.getBalance(newAccountAddress, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(web3.utils.fromWei(result, "ether") + " ETH");
    }
  });

  let spells = await dsa.Spell();
  await spells.add({
    connector: "COMPOUND-A",
    method: "deposit",
    args: [
      "A",
      "1000000000000000000", // 1 * 10^18 wei (1 Eth)
      0,
      0,
    ],
  });
  // await spells.add({
  //   connector: "COMPOUND-A",
  //   method: "depositRaw",
  //   args: [
  //     "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  //     "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",  //cEth on mainnet
  //     "1000000000000000000", // 1 * 10^18 wei (1 Eth)
  //     0,
  //     0,
  //   ],
  // });

  await spells
    .cast({
      gasPrice: Gas,
      value: "1000000000000000000",
    })
    .then(console.log);
}

async function Execute() {
  await Build();
  await Cast();
}
Execute().then(console.log("Done!"));
