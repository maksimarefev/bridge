import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

task("redeem", "Verifies the signature and mints the `amount` of tokens to the `msg.sender` address")
    .addParam("contractAddress", "The address of the bridge contract")
    .addParam("from", "The address of account which triggered the swap")
    .addParam("amount", "The amount of tokens to be redeemed")
    .addParam("nonce", "The nonce value issued by the signer backend service")
    .addParam("signature", "The signature made by the signer backend service")
    .setAction(async function (taskArgs, hre) {
        const ERC20Bridge: ContractFactory = await hre.ethers.getContractFactory("ERC20Bridge");
        const bridge: Contract = await ERC20Bridge.attach(taskArgs.contractAddress);
        const accounts: SignerWithAddress[] = await hre.ethers.getSigners();

        const redeemTx: any = await bridge.redeem(taskArgs.from, taskArgs.amount, taskArgs.nonce, taskArgs.signature);
        const redeemTxReceipt: any = await redeemTx.wait();

        console.log("Successfully redeemed %d tokens to %s", taskArgs.amount, await accounts[0].getAddress());
        console.log("Gas used: %d", redeemTxReceipt.gasUsed.toNumber() * redeemTxReceipt.effectiveGasPrice.toNumber());
    });
