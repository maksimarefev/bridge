import "dotenv/config";
import { ethers, Wallet } from "ethers";
import { Provider } from "@ethersproject/providers";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

function getProvider(): Provider {
    const bscURL: string = 'https://data-seed-prebsc-1-s1.binance.org:8545';

    if (!process.argv[2]) {
        throw new Error('Specifify the network name. Possible options are: rinkeby, bsc');
    }

    if (process.argv[2] === 'rinkeby') {
        return new ethers.providers.AlchemyProvider("rinkeby");
    } else if (process.argv[2] === 'bsc') {
        return new ethers.providers.JsonRpcProvider(bscURL);
    } else {
        throw new Error("Specifify the correct network name. Possible options are: rinkeby, bsc");
    }
}

function getContractAddress(): string {
    if (!process.argv[3]) {
        throw new Error('Specifify the contract address.');
    }

    return process.argv[3];
}

async function main() {
    let nonce: number = 0;

    const provider: Provider = getProvider();
    const contractAddress: string = getContractAddress();
    const signer: Wallet = new ethers.Wallet(PRIVATE_KEY);

    console.log("Network chosen: ", (await provider.getNetwork()).name);
    console.log("Signer address:", signer.address);

    const contract: any = new ethers.Contract(
        contractAddress, [ "event SwapInitialized(address indexed from, address indexed to, uint256 amount)" ], provider
    )

    //solidityKeccak256 will encodePacked and get a keccak256 of the result
    //The instance method wallet.signMessage will automatically prefix the message for you. This is required for security reasons. But Solidity does not.
    contract.on("SwapInitialized", async (from, to, amount) => {
        const message: Uint8Array = ethers.utils.arrayify(
            ethers.utils.solidityKeccak256([ 'address', 'address', 'uint256', 'uint256' ], [ from, to, amount, ++nonce ])
        );
        const signature: string = await signer.signMessage(message);
        console.log("(%s, %s, %d, %d) => %s: ", from, to, amount, nonce, signature);
    });
}

const oneHour: number = 1000 * 60 * 60;
main()
  .then(() => setInterval(() => process.exit(0), oneHour))
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });
