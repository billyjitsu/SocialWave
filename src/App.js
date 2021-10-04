import  React, {useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import waveJSON from './utils/WavePortal.json';

const App = () => {

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = waveJSON.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

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
        const provider = ethers.getDefaultProvider();

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

  useEffect ( () => {
    checkIfWalletConnected();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        Send me a message! Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
            <input className="placeHolder1"
               onChange={e => setMessage(e.target.value)}
               placeholder="Leave a message"
             ></input>

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
