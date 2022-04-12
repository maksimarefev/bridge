import "dotenv/config";
import { ethers, Wallet } from "ethers";
import { Provider } from "@ethersproject/providers";

function getContractAddresses(): [string, string] {
    if (!process.argv[2]) {
        throw new Error('Specifify the rinkeby contract address.');
    }

    if (!process.argv[3]) {
        throw new Error('Specifify the bsc contract address.');
    }

    return [process.argv[2], process.argv[3]];
}

function subscribe(contractAddress: string, provider: Provider, signer: Wallet) {
    let nonce: number = 0;

    const contract: any = new ethers.Contract(
        contractAddress,
        [ "event SwapInitialized(address indexed from, address indexed to, uint256 amount, uint256 networkId)" ],
        provider
    )

    //solidityKeccak256 will encodePacked and get a keccak256 of the result
    //The instance method wallet.signMessage will automatically prefix the message for you. This is required for security reasons. But Solidity does not.
    contract.on("SwapInitialized", async (from, to, amount, targetNetworkId) => {
        const message: Uint8Array = ethers.utils.arrayify(
            ethers.utils.solidityKeccak256(
                [ 'address', 'address', 'uint256', 'uint256', 'uint256' ],
                [ from, to, amount, targetNetworkId, ++nonce ]
            )
        );
        const signature: string = await signer.signMessage(message);
        console.log(
            "(from: %s, to: %s, amount: %d, targetNetworkId: %d, nonce: %d) => %s",
            from, to, amount, targetNetworkId, nonce, signature
        );
    });

    console.log("Subscribed to %s", contractAddress);
}

async function main() {
    const bscProvider: Provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
    const rinkebyProvider: Provider = new ethers.providers.AlchemyProvider("rinkeby");
    const [rinkebyContractAddress, bscContractAddress] = getContractAddresses();
    const privateKey: string = process.env.SIGNER_KEY;

    if (!privateKey) {
        throw new Error('Set up the `SIGNER_KEY` property in `.env` file.');
    }

    const signer: Wallet = new ethers.Wallet(privateKey);

    console.log("Signer address:", signer.address);

    subscribe(rinkebyContractAddress, rinkebyProvider, signer);
    subscribe(bscContractAddress, bscProvider, signer);
}

const oneHour: number = 1000 * 60 * 60;
main()
  .then(() => setInterval(() => process.exit(0), oneHour))
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });
