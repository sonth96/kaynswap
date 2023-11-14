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

### Improvements
- Current client code need to make multiple transactions in order to swap so you can use the KayRouter02.sol contract to swap within 1 transaction
- To use KayRouter02.sol, deploy the code and make change to index.ts on client logic.
