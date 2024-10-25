import React, { useEffect } from "react";
import { mnemonicToSeedSync } from "bip39";
import nacl from "tweetnacl";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import axios from 'axios'
// import dotenv from 'dotenv'
// dotenv.config(); this is not required in React

const SolanaWalletGeneration = ({ setListOfSolanaAccounts, listOfSolanaAccounts, numberOfSolanaAccounts, setNumberOfSolanaAccounts, setIsSolanaWalletCreated }) => {

  const SolanaRPCUrl = import.meta.env.VITE_SolanaRPCUrl;

  const handleGenerateSolanaAccounts = () => {
    //get the solanaWalletSeedPhrase from the local storage ideally should be in a useEffect ig
    const storedSolanaSeedPhrase = localStorage.getItem(
      "solanaWalletSeedPhrase"
    );

    if (!storedSolanaSeedPhrase) {
      console.error(
        "Seed phrase is not available. Please generate a wallet first."
      );
      return; // Exit if seed phrase is not found
    }

    //here we use the already created wallet seed phrase and generate more accounts on each click
    const seedPhrase = storedSolanaSeedPhrase;
    const seed = mnemonicToSeedSync(seedPhrase);

    const path = `m/44'/501'/${numberOfSolanaAccounts}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;

    const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);
    const secretKey = keyPair.secretKey; //this is the private key
    const publicKey = Keypair.fromSecretKey(secretKey).publicKey; //from secret/private key generate the public key

    //add the account number, public key and private key as an object to solana wallets list
    setListOfSolanaAccounts((prevAccounts) => [
      ...prevAccounts, //spread the previous accounts
      {
        accountNumber: numberOfSolanaAccounts,
        publicKey: publicKey.toBase58(),
        privateKey: Buffer.from(secretKey).toString("hex"),
        balance: null,
      },
    ]);

    //increase the number of accounts by 1
    setNumberOfSolanaAccounts((prevCount) => prevCount + 1);
    console.log(`The number of accounts now is ${numberOfSolanaAccounts}`);
  };

  const fetchSolanaAccountsBalance = async (publicKey) => {
    try{
      const response = await axios.post(SolanaRPCUrl, {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [publicKey]
      });

      const balanceInLamports = response.data.result.value;
      const balanceInSol = balanceInLamports / 1000000000;

      //update the balance of the newly generated account
      setListOfSolanaAccounts((prevAccounts) => prevAccounts.map((account) => account.publicKey === publicKey ? {...account, balance: balanceInSol} : account));
    } catch(error){
      console.error('Error fetching balance: ', error);
    }
  };

  //useEffect to fetch balances every 10s
  useEffect(() => {
    //function to update all accounts' balances
    const updateBalances = () => {
      listOfSolanaAccounts.forEach((account) => {
        fetchSolanaAccountsBalance(account.publicKey);
      })
    }

    //set an interval to fetch balances every 10s
    const interval = setInterval(() => {
      updateBalances();
    }, 10000)

    //clear interval on component unmount
    return () => clearInterval(interval);
  }, [listOfSolanaAccounts]) //effect runs when listOfSolanaAccounts is updated

  return (
    <div>
      <h2>Solana Wallet Generation Display</h2>
      <div>
        <h3>
          The seed phrase for your main HD Solana Wallet is :{" "}
          {localStorage.getItem("solanaWalletSeedPhrase")}
        </h3>
      </div>
      <div>
        <div>
          <button onClick={handleGenerateSolanaAccounts}>
            Generate more Accounts
          </button>
        </div>
        <h2>Your Accounts </h2>
        {listOfSolanaAccounts.length === 0 ? (
          <p>No accounts created yet.</p>
        ) : (
          listOfSolanaAccounts.map((account, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px 0",
              }}
            >
              <h4>Account {account.accountNumber}</h4>
              <p>
                <strong>Public Key:</strong> {account.publicKey}
              </p>
              <p>
                <strong>Private Key:</strong> {account.privateKey}
              </p>
              <p>
                <strong>Balance:</strong> {' '}{
                  account.balance !== null ? `${account.balance} SOL` : "Fetching balance..."
                }
              </p>
            </div>
          ))
        )}
      </div>
      <div>
        <button onClick={() => setIsSolanaWalletCreated(false)}>
          Go back to main page
        </button>
      </div>
    </div>
  );
};

export default SolanaWalletGeneration;
