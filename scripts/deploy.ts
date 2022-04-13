import { ethers } from "hardhat";
import { execSync } from "child_process";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20Bridge, ERC20Bridge__factory, StepanToken, StepanToken__factory } from '../typechain-types';

function verify(contractAddress: string, network: string, ...constructorParameters: any[]) {
    if (!contractAddress) {
        console.error("No contract address was provided");
        return;
    }

    const constructorParametersAsString: string =
        !constructorParameters || constructorParameters.length == 0 ? "" : constructorParameters.join(" ");

    const command: string = "npx hardhat verify --network " + network + " " + contractAddress + " " + constructorParametersAsString;
    console.log("Running command:", command);

    try {
        execSync(command, { encoding: "utf-8" });
    } catch (error) {
        //do nothing, it always fails but in fact a contract becomes verified
    }
}

async function main() {

    const networkId: number = (await ethers.provider.getNetwork()).chainId;
    const networkName: string = (() => {
        if (networkId === 97) {
            return "bsc";
        } else if (networkId === 4) {
            return "rinkeby";
        } else {
            throw new Error("Invalid network chosen");
        }
    })();

    const accounts: SignerWithAddress[] = await ethers.getSigners();

    if (accounts.length == 0) {
        throw new Error('No accounts were provided');
    }

    const signerAddress: string = await accounts[0].getAddress();

    console.log("Deploying contracts with the account:", accounts[0].address);

    console.log("Deploying ERC20 contract");
    const StepanToken: StepanToken__factory = (await ethers.getContractFactory("StepanToken")) as StepanToken__factory;
    const erc20: StepanToken = await StepanToken.deploy();
    await erc20.deployed();
    console.log("ERC20 contract had been deployed to:", erc20.address);

    console.log("Deploying bridge contract");
    const ERC20Bridge: ERC20Bridge__factory = (await ethers.getContractFactory("ERC20Bridge")) as ERC20Bridge__factory;
    const bridge: ERC20Bridge = await ERC20Bridge.deploy(signerAddress, erc20.address, networkId);
    await bridge.deployed();
    console.log("Bridge had been deployed to:", bridge.address);

    await erc20.transferOwnership(bridge.address);

    console.log("Verifying NFT contract..");
    verify(erc20.address, networkName);
    console.log("NFT contract is verified");

    console.log("Verifying bridge contract..");
    verify(bridge.address, networkName, signerAddress, erc20.address, networkId);
    console.log("Bridge contract is verified");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
