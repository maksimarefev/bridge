import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

task("swap", "Burns the `amount` of tokens and emits SwapInitialized event")
    .addParam("contractAddress", "The address of the bridge contract")
    .addParam("to", "The recepient address")
    .addParam("amount", "The amount of tokens to be swapped")
    .setAction(async function (taskArgs, hre) {
        const ERC20Bridge: ContractFactory = await hre.ethers.getContractFactory("ERC20Bridge");
        const bridge: Contract = await ERC20Bridge.attach(taskArgs.contractAddress);

        const swapTx: any = await bridge.swap(taskArgs.to, taskArgs.amount);
        const swapTxReceipt: any = await swapTx.wait();
        const swapInitializedEvent: Event = swapTxReceipt.events[0];

        console.log(
            "Successfully triggered the swap operation for transferring %d tokens from %s to %s",
            swapInitializedEvent.args.amount,
            swapInitializedEvent.args.from,
            swapInitializedEvent.args.to
        );
        console.log("Gas used: %d", swapTxReceipt.gasUsed.toNumber() * swapTxReceipt.effectiveGasPrice.toNumber());
    });
