const hre = require("hardhat");
const { web3 } = require("hardhat");
const { ethers } = require("hardhat");
const DSA = require("dsa-connect");
const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.ethApiKey;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const dsa = new DSA({
  web3: web3,
  mode: "node",
  privateKey: PRIVATE_KEY,
});

const my_address = "0x57A8C355790AEe45341f738C8Fb3a35475C86D51";

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
  const Prices = await getCurrentGasPrices();
  const Gas = Prices.high * 1000000000;
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
  const Gas = Prices.high * 1000000000;
  console.log(Gas);

  await hre.network.provider.send("hardhat_setBalance", [
    newAccountAddress,
    ethers.utils.parseEther("15.0").toHexString(),
  ]);

  let spells = await dsa.Spell();
  await spells.add({
    connector: "COMPOUND-A",
    method: "deposit",
    args: [
      "ETH-A",
      "1000000000000000000", // 1 * 10^18 wei (1 Eth)
      0,
      0,
    ],
  });

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
