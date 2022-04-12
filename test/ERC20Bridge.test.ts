import { expect, use } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import { FakeContract, smock } from "@defi-wonderland/smock";
import { ERC20Bridge, ERC20Bridge__factory } from "../typechain-types";

import StepanToken from "../artifacts/contracts/StepanToken.sol/StepanToken.json";

use(smock.matchers);

describe("ERC20Bridge", function () {

    let bob: Signer;
    let alice: Signer;
    let erc20Bridge: ERC20Bridge;
    let erc20Mock: FakeContract<Contract>;

    async function sign(from: string, to: string, amount: number, nonce: number, signer: Signer): Promise<string> {
        const message: Uint8Array = ethers.utils.arrayify(
            ethers.utils.solidityKeccak256(
                [ 'address', 'address', 'uint256', 'uint256' ],
                [ from, to, amount, nonce ]
            )
        );
        return signer.signMessage(message);
    }

    beforeEach("Deploying contract", async function () {
        [alice, bob] = await ethers.getSigners();

        erc20Mock = await smock.fake(StepanToken.abi);

        const ERC20BridgeFactory: ERC20Bridge__factory =
            (await ethers.getContractFactory("ERC20Bridge")) as ERC20Bridge__factory;

        erc20Bridge = await ERC20BridgeFactory.deploy(await alice.getAddress(), erc20Mock.address);
   });

   describe("swap", async function() {
        it("Should now allow to swap on insufficient balance", async function() {
            const aliceAddress: string = await alice.getAddress();
            const aliceBalance: number = 0;
            const amount: number = 1;
            await erc20Mock.balanceOf.whenCalledWith(aliceAddress).returns(aliceBalance);

            const swapTxPromise: Promise<any> = erc20Bridge.swap(aliceAddress, amount);

            await expect(swapTxPromise).to.be.revertedWith("Sender has not enough balance");
        });

        it("Should now allow to swap on insufficient allowance", async function() {
            const aliceAddress: string = await alice.getAddress();
            const aliceBalance: number = 1;
            const amount: number = 1;
            const allowance: number = 0;
            await erc20Mock.balanceOf.whenCalledWith(aliceAddress).returns(aliceBalance);
            await erc20Mock.allowance.whenCalledWith(aliceAddress, erc20Bridge.address).returns(allowance);

            const swapTxPromise: Promise<any> = erc20Bridge.swap(aliceAddress, amount);

            await expect(swapTxPromise).to.be.revertedWith("Bridge has not enough allowance");
        });

        it("Should emit Swap event event", async function() {
            const aliceAddress: string = await alice.getAddress();
            const aliceBalance: number = 1;
            const amount: number = 1;
            const allowance: number = 1;
            await erc20Mock.balanceOf.whenCalledWith(aliceAddress).returns(aliceBalance);
            await erc20Mock.allowance.whenCalledWith(aliceAddress, erc20Bridge.address).returns(allowance);

            const swapTxPromise: Promise<any> = erc20Bridge.swap(aliceAddress, amount);

            await expect(swapTxPromise).to.emit(erc20Bridge, "SwapInitialized").withArgs(aliceAddress, aliceAddress, amount);
        });

        it("Should burn tokens", async function() {
            const aliceAddress: string = await alice.getAddress();
            const aliceBalance: number = 1;
            const amount: number = 1;
            const allowance: number = 1;
            await erc20Mock.balanceOf.whenCalledWith(aliceAddress).returns(aliceBalance);
            await erc20Mock.allowance.whenCalledWith(aliceAddress, erc20Bridge.address).returns(allowance);

            await erc20Bridge.swap(aliceAddress, amount);

            expect(erc20Mock.burnFrom).to.be.calledOnceWith(aliceAddress, amount);
        });
   });

   describe("redeem", async function() {
        it("Should not allow to redeem twice", async function() {
            const aliceAddress: string = await alice.getAddress();
            const amount: number = 1;
            const nonce: number = 1;
            const signature: string = await sign(aliceAddress, aliceAddress, amount, nonce, alice);
            await erc20Mock.mint.whenCalledWith(aliceAddress, amount).returns();

            await erc20Bridge.redeem(aliceAddress, amount, nonce, signature);
            const redeemTxPromise: Promise<any> = erc20Bridge.redeem(aliceAddress, amount, nonce, signature);

            await expect(redeemTxPromise).to.be.revertedWith("Transaction already handled");
        });

        it("Should not allow to redeem on wrong signer address", async function() {
            const aliceAddress: string = await alice.getAddress();
            const amount: number = 1;
            const nonce: number = 1;
            const signature: string = await sign(aliceAddress, aliceAddress, amount, nonce, bob);
            await erc20Mock.mint.whenCalledWith(aliceAddress, amount).returns();

            const redeemTxPromise: Promise<any> = erc20Bridge.redeem(aliceAddress, amount, nonce, signature);

            await expect(redeemTxPromise).to.be.revertedWith("Failed signature verification");
        });

        it("Should mint tokens", async function() {
            const aliceAddress: string = await alice.getAddress();
            const amount: number = 1;
            const nonce: number = 1;
            const signature: string = await sign(aliceAddress, aliceAddress, amount, nonce, alice);
            await erc20Mock.mint.whenCalledWith(aliceAddress, amount).returns();

            await erc20Bridge.redeem(aliceAddress, amount, nonce, signature);

            expect(erc20Mock.mint).to.be.calledOnceWith(aliceAddress, amount);
        });
   });
});