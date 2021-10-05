import  React, {useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import waveJSON from './utils/WavePortal.json';

const App = () => {

  const contractAddress = "0x1969a74eC7d83Be12425c7380750eeA9BeD82841";
  const contractABI = waveJSON.abi;
  

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const [chainId, setChainId] = useState(window.ethereum.request({ method: 'eth_chainId' }));


  const checkIfWalletConnected = async () => {
    try {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        /*
        * Check if we're authorized to access the user's wallet
        */
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        //check network?
        //find this chain id
        const chain = await window.ethereum.request({method: 'eth_chainId'});
        //chainId = chain;
        console.log("chain ID:", chain)
        console.log("global Chain Id:", chainId)

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account)
            getAllWaves()
        } else {
            console.log("No authorized account found")
        }
    } catch (error) {
        console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });     

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try{
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await waveportalContract.getTotalWaves();
        console.log("Total Waves: ", count.toNumber());

        const waveTxn = await waveportalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);

        count = await waveportalContract.getTotalWaves();
        console.log("Total Waves: ", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }

    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer =  provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);
      
        const waves = await waveportalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp *1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);

        /**
         * Listen in for emitter events!
         * NewWave is the name of the event
         * event NewWave(address indexed from, uint256 timestamp, string message);
         */
        waveportalContract.on("NewWave", (from, timestamp, message) => {

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });



      } else {
      console.log("Ethereum object doesn't exist")
      }
    } catch (error) {
      console.log(error);
    }

  }

  const changeNetwork = async () => {

    const { ethereum } = window;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4' }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: '0x4', rpcUrl: 'https://rinkeby-light.eth.linkpool.io/' /* ... */ }],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  }

  useEffect(() => {
    async function getChainId() {
      const ethChainId = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(ethChainId)
    }
  
    getChainId()
  }, [])

  useEffect ( () => {
    checkIfWalletConnected();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 What's Up!
        </div>

        <div className="bio">
        Send me a message! Connect your Ethereum wallet and wave at me!
        </div>
        <p className="bio">(15 minute wait time between messages)</p>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
            <input className="placeHolder1"
               onChange={e => setMessage(e.target.value)}
               placeholder="Leave a message"
             ></input>
        
        { chainId === '0x4' ? null :(  
          <div className="bio">
          You are not connected to Rinkeby network. Please change the
          network you are connected to in your wallet.
            <div>
             <button className="waveButton" onClick={changeNetwork}>
             Change to Rinkeby
            </button>
            </div>
        </div>
        )}
              

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}              

        {allWaves.map((wave, index) => {
          return(
            <div key={index} style={{ backgroundColor: "#61A7A0", marginTop: "16px", padding: "8px", borderRadius: "10px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
