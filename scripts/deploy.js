const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BookByBlock contracts...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
  
  // Deploy EventFactory
  console.log("\n🏭 Deploying EventFactory...");
  const EventFactory = await ethers.getContractFactory("EventFactory");
  const factory = await EventFactory.deploy(deployer.address); // Fee recipient = deployer
  
  await factory.deployed();
  console.log("✅ EventFactory deployed to:", factory.address);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      EventFactory: {
        address: factory.address,
        deploymentHash: factory.deployTransaction.hash
      }
    },
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("Factory Address:", factory.address);
  console.log("Deployment Hash:", factory.deployTransaction.hash);
  
  // Create sample event for testing
  if (hre.network.name === "localhost") {
    console.log("\n🎫 Creating sample event...");
    
    const tx = await factory.createEvent(
      "Sample Concert",
      "CONCERT",
      ethers.utils.parseEther("0.01"), // 0.01 ETH base price
      100 // 100 tickets
    );
    
    const receipt = await tx.wait();
    const eventCreatedEvent = receipt.events?.find(e => e.event === "EventCreated");
    
    if (eventCreatedEvent) {
      console.log("✅ Sample event created:");
      console.log("Event ID:", eventCreatedEvent.args.eventId.toString());
      console.log("Ticket Contract:", eventCreatedEvent.args.ticketContract);
    }
  }
  
  // Save to file for frontend/backend
  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\n💾 Deployment info saved to deployments/${hre.network.name}.json`);
  
  // Environment variables for backend
  console.log("\n🔧 Add these to your .env file:");
  console.log(`FACTORY_ADDRESS=${factory.address}`);
  console.log(`NETWORK=${hre.network.name}`);
  console.log(`CHAIN_ID=${deploymentInfo.chainId}`);
  
  if (hre.network.name !== "localhost") {
    console.log("\n🔍 Verify contracts with:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${factory.address} ${deployer.address}`);
  }
  
  console.log("\n🎉 Deployment complete! Ready for hackathon demo! 🚀");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
