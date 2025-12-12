const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BookByBlock contracts...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");
  
  // Deploy EventFactory
  console.log("\n🏭 Deploying EventFactory...");
  const EventFactory = await ethers.getContractFactory("EventFactory");
  const factory = await EventFactory.deploy(deployer.address); // Fee recipient = deployer
  
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ EventFactory deployed to:", factoryAddress);
  
  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      EventFactory: {
        address: factoryAddress,
        deploymentHash: factory.deploymentTransaction().hash
      }
    },
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("Factory Address:", factoryAddress);
  console.log("Deployment Hash:", factory.deploymentTransaction().hash);
  
  // Create sample event for testing
  if (hre.network.name === "localhost") {
    console.log("\n🎫 Creating sample event...");
    
    const tx = await factory.createEvent(
      "Sample Concert",
      "CONCERT",
      ethers.parseEther("0.01"), // 0.01 MATIC base price
      100 // 100 tickets
    );
    
    const receipt = await tx.wait();
    const eventCreatedEvent = receipt.logs?.find(log => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed.name === "EventCreated";
      } catch {
        return false;
      }
    });
    
    if (eventCreatedEvent) {
      const parsedEvent = factory.interface.parseLog(eventCreatedEvent);
      console.log("✅ Sample event created:");
      console.log("Event ID:", parsedEvent.args.eventId.toString());
      console.log("Ticket Contract:", parsedEvent.args.ticketContract);
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
  console.log(`FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`NETWORK=${hre.network.name}`);
  console.log(`CHAIN_ID=${deploymentInfo.chainId}`);
  
  if (hre.network.name !== "localhost") {
    console.log("\n🔍 Verify contracts with:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${factoryAddress} ${deployer.address}`);
    console.log(`\n🌐 View on Polygonscan:`);
    if (hre.network.name === "amoy") {
      console.log(`https://amoy.polygonscan.com/address/${factoryAddress}`);
    } else {
      console.log(`https://polygonscan.com/address/${factoryAddress}`);
    }
  }
  
  console.log("\n🎉 Deployment complete! Ready for hackathon demo! 🚀");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
