import "dotenv/config";
import "solidity-coverage";
import "@typechain/hardhat";
import "./tasks/swap.ts";
import "./tasks/redeem.ts";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const BSC_API_KEY = process.env.BSC_API_KEY;

const config: HardhatUserConfig = {
    solidity: "0.8.1",
    networks: {
        rinkeby: {
          url: "https://eth-rinkeby.alchemyapi.io/v2/" + ALCHEMY_API_KEY,
          accounts: [`0x${PRIVATE_KEY}`]
        },
        bsc: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: [`0x${PRIVATE_KEY}`]
        }
    },
    etherscan: {
        apiKey: {
          rinkeby: ETHERSCAN_API_KEY,
          bscTestnet: BSC_API_KEY
        }
    }
};

export default config;