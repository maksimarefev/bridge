## Overview
Crosschain bridge implementation (Ethereum <--> BSC).

## Configuring a secret
In the root folder create *.env* file and fill it the following properties:<br/>
```
{
    ALCHEMY_API_KEY=[ALCHEMY API KEY]
    PRIVATE_KEY=[YOUR ACCOUNT's PRIVATE KEY]
    ETHERSCAN_API_KEY=[YOUR ETHERSCAN APY KEY]
}
```

## How to deploy
1. From the root folder run ``` npm run deploy ```
2. Save the contract address for future interactions

## How to run a task
From the root folder run<br/>``` npx hardhat [task name] --network rinkeby --contract-address [contract address] --argument [argument value] ```<br/>Example:<br/>``` npx hardhat createItem --network rinkeby --contract-address 0xa9F8A1d1235De819CA9F0419AB257071e467fBb9 --token-identifier QmVW8oSySifTBDBvkTGC7J5r9UDCJ4Ndiig6B3EHvURt5S --token-owner 0x12D8F31923Aa0ACC543b96733Bc0ed348Ef44970 ```

## The list of available tasks
| Task name | Description                                                                          | Options                                                                                                                                                                                                                                                                                                  |
|-----------|--------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| swap      | Burns the `amount` of tokens and emits SwapInitialized event                         | --contract-address => An address of a contract</br>--to => The recepient address</br>--amount => The amount of tokens to be swapped                                                                                                                                                                      |
| redeem    | Verifies the signature and mints the `amount` of tokens to the `msg.sender` address" | --contract-address => An address of a contract</br>--from => The address of account which triggered the swap</br>--amount => The amount of tokens to be redeemed</br>--nonce => The nonce value issued by the signer backend service</br>--signature => The signature made by the signer backend service |

## How to run tests and evaluate the coverage
From the root folder run ``` npx hardhat coverage ```
## Current test and coverage results for *i7-8550U 1.80GHz/16Gb RAM/WIN10 x64*
```
ERC20Bridge
    swap
      √ Should now allow to swap on insufficient balance (54ms)
      √ Should now allow to swap on insufficient allowance (40ms)
      √ Should emit Swap event event (49ms)
      √ Should burn tokens (46ms)
    redeem
      √ Should not allow to redeem twice (64ms)
      √ Should not allow to redeem on wrong signer address
      √ Should mint tokens (47ms)

    7 passing (1s)
```
| File               | % Stmts    | % Branch   | % Funcs    | % Lines    | Uncovered Lines  |
|--------------------|------------|------------|------------|------------|------------------|
| contracts\         | 100        | 100        | 100        | 100        |                  |
| ERC20Bridge.sol    | 100        | 100        | 100        | 100        |                  |
| ------------------ | ---------- | ---------- | ---------- | ---------- | ---------------- |
| All files          | 100        | 100        | 100        | 100        |                  |

## Project dependencies
* @defi-wonderland/smock#2.0.7
* @m.arefev/nft#1.0.1
* @nomiclabs/ethereumjs-vm#4.2.2
* @nomiclabs/hardhat-ethers#2.0.5
* @nomiclabs/hardhat-etherscan#3.0.3
* @nomiclabs/hardhat-waffle#2.0.3
* @nomiclabs/hardhat-web3#2.0.0
* @openzeppelin/contracts#4.5.0
* @typechain/ethers-v5#10.0.0
* @typechain/hardhat#6.0.0
* @types/chai#4.3.0
* @types/mocha#9.1.0
* @types/node#17.0.23
* @typescript-eslint/eslint-plugin#5.18.0
* @typescript-eslint/parser#5.18.0
* chai#4.3.6
* dotenv#16.0.0
* eslint#8.13.0
* ethereum-waffle#3.4.4
* hardhat#2.9.3
* solhint#3.3.7
* solidity-coverage#0.7.20
* ts-node#10.7.0
* typechain#8.0.0
* typescript#4.6.3
