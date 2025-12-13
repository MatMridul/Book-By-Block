const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  
  console.log("Wallet Address:", address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");
  console.log("Balance (Wei):", balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
