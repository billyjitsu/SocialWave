const main = async () => {

    
    const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
    const waveContract = await waveContractFactory.deploy();
    const [owner, rando] = await hre.ethers.getSigners();
    await waveContract.deployed();
    
    console.log("Contract deployed to:", waveContract.address);

    let waveCount;
    waveCount = await waveContract.getTotalWaves();

    let waveTxn = await waveContract.wave("A message");
    await waveTxn.wait();

    waveTxn = await waveContract.connect(rando).wave("Another message");
    await waveTxn.wait();

    waveTxn = await waveContract.wave("A 3rd message");
    await waveTxn.wait();

    waveCount = await waveContract.getTotalWaves();
    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);


  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();