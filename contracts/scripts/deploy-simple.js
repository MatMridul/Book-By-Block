const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SimpleEventFactory contract...");
  
  const SimpleEventFactory = await ethers.getContractFactory("SimpleEventFactory");
  const eventFactory = await SimpleEventFactory.deploy();
  
  await eventFactory.waitForDeployment();
  const address = await eventFactory.getAddress();
  
  console.log("✅ SimpleEventFactory deployed to:", address);
  console.log("📋 Copy this address to your .env.deploy file as CONTRACT_ADDRESS");
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: address,
    network: network.name,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
