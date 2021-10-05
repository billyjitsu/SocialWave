pragma solidity ^0.8.0;

import "hardhat/console.sol";


contract WavePortal {
    uint256 totalWaves;
    
    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }

    Wave[] waves;

    mapping (address => uint256) public lastWaveAt;

    event NewWave(address indexed from, uint256 timestamp, string message);

    constructor() {

    }

    function wave(string memory _message) public {
        require(lastWaveAt[msg.sender] + 15 minutes < block.timestamp, "Wait 15m");
        lastWaveAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        console.log("%s has waved", msg.sender);

        waves.push(Wave(msg.sender, _message, block.timestamp));

        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getTotalWaves() public view returns(uint256) {
        return totalWaves;
    }

    function getAllWaves() public view returns(Wave[] memory) {
        return waves;
    }


}