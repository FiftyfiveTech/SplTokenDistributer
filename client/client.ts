import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// token mint address
const mintAddress = "5d1TVSBUHgYtm2BHUjPBvVgrAth91ShkPGJ7wNb6byGj";
// recivers wallet address list
const reciverAddresses = [
  "3XviAdtPh5tZmg8Jc77KJs4KqJYNPmnJKcN5UeKWtrCk",
  "D3jT9sFr1VjAaqR3mS2kPQTUns1R2pyF9WXGupqTQo7q",
  "HpvZqYRdvmm8KeyzQ9hcaZmDB4ywiWgDdsq4fLztu1es",
];
// percentage to distribute
const transferPercentage = 25;

// get total supply of token
const supplyData = await pg.connection.getTokenSupply(
  new web3.PublicKey(mintAddress)
);
console.log("Total Supply:", supplyData.value.amount);

// get token wallet of sender
const fromAta = await getOrCreateAssociatedTokenAccount(
  pg.connection,
  pg.wallet.keypair,
  new web3.PublicKey(mintAddress),
  pg.wallet.publicKey
);
console.log("You have:", fromAta.amount.toString());

// fetch and build recivers token wallet list
let toAtas = [];
for (let i = 0; i < reciverAddresses.length; i++) {
  const toAta = await getOrCreateAssociatedTokenAccount(
    pg.connection,
    pg.wallet.keypair,
    new web3.PublicKey(mintAddress),
    new web3.PublicKey(reciverAddresses[i])
  );
  toAtas.push({ pubkey: toAta.address, isSigner: false, isWritable: false });
}

// calculate total amount to disctribute
const total_amount =
  (fromAta.amount * BigInt(transferPercentage)) / BigInt(100);

console.log("Total amount to distrbute:", total_amount.toString());

// calculate approx amount for every reciver
const amount = total_amount / BigInt(toAtas.length);

// util: generate a randomized list of amount with length of count
function generateRandomAmountList(amount, count) {
  const originalArray = Array(count).fill(amount);

  // Calculate the sum of the original array
  const sum = originalArray.reduce((acc, curr) => acc + curr, 0);

  // Generate a new array with the same length as the original array
  const newArray = originalArray.map(() => Math.random());

  // Calculate the sum of the new array
  const newSum = newArray.reduce((acc, curr) => acc + curr, 0);

  // Scale the new array so that its sum matches the sum of the original array
  const scaledArray = newArray.map((num) =>
    parseInt((num * (sum / newSum)).toFixed(2))
  );
  let diff = sum - scaledArray.reduce((acc, curr) => acc + curr, 0);

  while (diff > 0) {
    let index = Math.floor(Math.random() * scaledArray.length);
    scaledArray[index] += 1;
    diff -= 1;
  }

  return scaledArray;
}

// create a list of tokens per reciver
const amount_list = generateRandomAmountList(
  parseInt(amount.toString()),
  toAtas.length
);

// start sending tokens to reciver
for (let i = 0; i < toAtas.length; i++) {
  console.log(
    "Sending",
    amount_list[i],
    "Token to",
    toAtas[i].pubkey.toString(),
    " ..."
  );

  // fetch latest hash block from blockchain
  let latestBlockhash = await pg.connection.getLatestBlockhash("finalized");

  // create tx for transfer and call transfer_spl_tokens in SOL program
  const tx = await pg.program.methods
    .transferSplTokens(new BN(amount_list[i]))
    .accounts({
      from: pg.wallet.publicKey,
      fromAta: fromAta.address,
      toAta: toAtas[i].pubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(toAtas)
    .signers([pg.wallet.keypair, pg.wallet.keypair])
    .rpc();

  //confirm the transaction and log the tx URL
  await pg.connection.confirmTransaction({
    signature: tx,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });
  console.log(
    "Transaction Complete: ",
    `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  );
}
