# SPL Token Distributer

> Playground: https://beta.solpg.io/65c4ed7bcffcf4b13384cf56 
> Program ID: GhAMmahgduFithFiL8HWU4QJiU2gXgFAAnuTsss1JA44

In this SPL Token Distributer we ask for `Token Mint Address`, `Recipient Main Wallet Address`, `Percentage Of Token to Distribute` and `Distributer/Sender Wallet Address` (Sender wallet address automatically loads from current session or choosed wallet).

---

## Process of Client Script

1. Fetch the total supply of token using mint address
2. Get Token wallet address for `Distributer/Sender Wallet Address` and get current available token balance
3. For every `Recipient Main Wallet Address` get Token wallet address
4. Calculate **Total Amount** of token to distribute
5. Assign random amount of token for every reviver with total sum == **Total Amount**
6. Init *Transaction* for token transfer


## Process Of SOL Program (a.k.a Contract)

> SOL Program is written in Rust using Anchor (Solana's Sealevel runtime framework)

- Input Payload 
    - from: sender wallet pubkey
    - from_ata: sender token wallet pubkey
    - to_ata: receiver token wallet pubkey
    - token_program: token program pubkey
    - amount: token amount to transfer

Transaction is been init based on above details.


### Referance and Links
- https://beta.solpg.io/ 
- https://www.anchor-lang.com/ 