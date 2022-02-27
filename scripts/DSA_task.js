const hre = require("hardhat");
const Web3 = require("web3");
const DSA = require("dsa-connect");
const axios = require("axios");
require("dotenv").config();
//console.log(process.env); // remove this after you've confirmed it working

const apiKey = process.env.ethApiKey;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
console.log(PRIVATE_KEY);
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`
  )
);

const dsa = new DSA({
  web3: web3,
  mode: "node",
  privateKey: PRIVATE_KEY,
});

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
  const Prices = await getCurrentGasPrices();
  const Gas = Prices.low;
  console.log(Gas);
  await dsa
    .build({
      gasPrice: Gas, // estimated gas price
    })
    .then(console.log);
}

Build();
// const address = "0xB4Ee861482814c4Bb1c6a649aF77Bd78DbDBf59B";
// dsa.getAccounts(address).then(console.log);

// let spells = dsa.Spell();

// spells.add({
//   connector: "compound",
//   method: "deposit",
//   args: [
//     "0x6B175474E89094C44Da98b954EedeAC495271d0F",
//     "100000000000000000000", // 100 * 10^18 wei
//     0,
//     0,
//   ],
// });

// spells.cast().then(console.log);
