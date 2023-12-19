## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**


### Test KAY mainnet cypress fork

```shell
$ sh run_test.sh
```
### Prerequisites before making any deployment

- Rename env.example to .env
- Supply PRIVATE_KEY env (### prefix 0x + private_key exported from metamask or any wallet ###)

### Deploy KAY mainnet cypress fork

```shell
$ sh deploy.sh
```


### Client

### Prerequisites before making swap with client

- cd to client directory
- Rename env.example to .env
- Supply PRIVATE_KEY env (### prefix 0x + private_key exported from metamask or any wallet ###)
- Wallet need to have fee to pay for transactions
- Edit swap.sh file to change swap token and amount to swap

```shell
$ cd client
$ sh swap.sh

```
### How to use

See package.json
"scripts": {
    "kayswap": "node ./dist/kayswap.js tokenA 0x9eaeFb09fe4aABFbE6b1ca316a3c36aFC83A393F tokenB 0x754288077D0fF82AF7a5317C7CB8c444D421d103 amount 0.1",
    "kayswap_native": "node ./dist/kayswap.js tokenA 0x0000000000000000000000000000000000000000 tokenB 0x754288077D0fF82AF7a5317C7CB8c444D421d103 amount 0.1",
    "pancake_native": "tsx pancake.ts tokenA native tokenB usdt amount 0.001",
    "pancake": "tsx pancake.ts tokenA usdt tokenB cake amount 0.01"
  }

pancake_native => when you want to swap from BNB -> aToken or in reversed with tsx pancake.ts tokenA usdt tokenB native amount 0.001

pancake => when you want to swap from aToken -> bToken ( not BNB, but WBNB is okay)




### Improvements
- Current client code need to make multiple transactions in order to swap so you can use the KayRouter02.sol contract to swap within 1 transaction
- To use KayRouter02.sol, deploy the code and make change to index.ts on client logic.
