import "dotenv/config";
import { ethers, Wallet, EventFilter } from "ethers";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

//todo arefev: do not forget the nonce
async function main() {
    const signer: Wallet = new ethers.Wallet(PRIVATE_KEY);

    console.log("Signer address:", signer.address);

    const provider: any = new ethers.providers.AlchemyProvider("rinkeby");

    //todo arefev: replace it
    const contract: any = new ethers.Contract(
        "0x9e91768ab4b39d7a986860f985e6cccc11681f8d",
        [ //abi
            "event Transfer(address indexed from, address indexed to, uint256 value)",
            "event Approval (address indexed owner, address indexed spender, uint256 value)"
        ],
        provider
    )

    //solidityKeccak256 will encodePacked and get a keccak256 of the result
    //The instance method wallet.signMessage will automatically prefix the message for you. This is required for security reasons. But Solidity does not.
    contract.on("Transfer", async (from, to, value) => {
        console.log("Received Transfer event:", "from: ", from, "to:", to, "value:", value);
        const message: Uint8Array = ethers.utils.arrayify(
            ethers.utils.solidityKeccak256([ 'address', 'address', 'uint256' ], [ from, to, value ])
        );
        console.log("Message length:", message.length);
        const signature: string = await signer.signMessage(message);
        const recoverAddress: string = ethers.utils.verifyMessage(message, signature);
        console.log("Signature: ", signature, "|","Recovered address: ", recoverAddress);
    });
}

main()
  .then(() => setInterval(() => process.exit(0), 1000 * 60 * 5)) //5 minutes
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
