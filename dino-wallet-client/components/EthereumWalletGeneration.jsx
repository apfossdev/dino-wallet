import React, { useEffect } from "react";
import { mnemonicToSeedSync } from "bip39";
import axios from "axios";
import { Wallet, HDNodeWallet } from "ethers";

const EthereumWalletGeneration = ({
  setListOfEthereumAccounts,
  listOfEthereumAccounts,
  numberOfEthereumAccounts,
  setNumberOfEthereumAccounts,
  setIsEthereumWalletCreated,
}) => {
  const EthereumRPCUrl = import.meta.env.VITE_EthereumRPCUrl;

  const handleGenerateEthereumAccounts = ( ) => {
    //get the ethereumWalletSeedPhrase from the local storage ideally should be in a useEffect ig
    const storedEthereumSeedPhrase = localStorage.getItem(
      "ethereumWalletSeedPhrase"
    );

    if (!storedEthereumSeedPhrase) {
      console.error(
        "Seed phrase is not available. Please generate a wallet first."
      );
      return; // Exit if seed phrase is not found
    }

    //here we use the already created wallet seed phrase and generate more accounts on each click
    const seedPhrase = storedEthereumSeedPhrase;
    const seed = mnemonicToSeedSync(seedPhrase);

    const path = `m/44'/60'/${numberOfEthereumAccounts}'/0'`;
    // const derivedSeed = derivePath(path, seed.toString("hex")).key;

    // const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);
    // const secretKey = keyPair.secretKey; //this is the private key
    // const publicKey = Keypair.fromSecretKey(secretKey).publicKey; //from secret/private key generate the public key

    const hdNode = HDNodeWallet.fromSeed(seed); //create a hd wallet instance from the seed generated above
    const child = hdNode.derivePath(path); //derive a child wallet from hd node using a specific derivation path
    const secretKey = child.privateKey; //extract the private key from the derived child wallet
    const publicKey = child.address; //generate public key from child wallet's private key
    const wallet = new Wallet(secretKey); //create a new wallet instance using the private key

    //add the account number, public key and private key as an object to ethereum wallets list
    setListOfEthereumAccounts((prevAccounts) => [
      ...prevAccounts, //spread the previous accounts
      {
        accountNumber: numberOfEthereumAccounts,
        publicKey: publicKey,
        privateKey: secretKey,
        balance: null,
      },
    ]);

    //increase the number of accounts by 1
    setNumberOfEthereumAccounts((prevCount) => prevCount + 1);
    console.log(`The number of accounts now is ${numberOfEthereumAccounts}`);
  };

  const fetchEthereumAccountsBalance = async (publicKey) => {
    try {
      const response = await axios.post(EthereumRPCUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [publicKey, 'latest'],
      });

      const balanceInWei = Number(response.data.result); //converting hex response to integers
      console.log(balanceInWei);
      const balanceInEth = balanceInWei / Number(1e18); //only same types can be divided and should be divided with
      console.log(balanceInEth);

      //update the balance of the newly generated account
      setListOfEthereumAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.publicKey === publicKey
            ? { ...account, balance: balanceInEth }
            : account
        )
      );
    } catch (error) {
      console.error("Error fetching balance: ", error);
    }
  };

  //useEffect to fetch balances every 10s
  useEffect(() => {
    //function to update all accounts' balances
    const updateBalances = () => {
      listOfEthereumAccounts.forEach((account) => {
        fetchEthereumAccountsBalance(account.publicKey);
      });
    };

    //set an interval to fetch balances every 10s
    const interval = setInterval(() => {
      updateBalances();
    }, 10000);

    //clear interval on component unmount
    return () => clearInterval(interval);
  }, [listOfEthereumAccounts]); //effect runs when listOfEthereumAccounts is updated

  return (
    <div>
      <h2>Ethereum Wallet Generation Display</h2>
      <div>
        <h3>
          The seed phrase for your main HD Ethereum Wallet is :{" "}
          {localStorage.getItem("ethereumWalletSeedPhrase")}
        </h3>
      </div>
      <div>
        <div>
          <button onClick={handleGenerateEthereumAccounts}>
            Generate more Accounts
          </button>
        </div>
        <h2>Your Accounts </h2>
        {listOfEthereumAccounts.length === 0 ? (
          <p>No accounts created yet.</p>
        ) : (
          listOfEthereumAccounts.map((account, index) => (
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
                <strong>Balance:</strong>{" "}
                {account.balance !== null
                  ? `${account.balance} ETH`
                  : "Fetching balance..."}
              </p>
            </div>
          ))
        )}
      </div>
      <div>
        <button onClick={() => setIsEthereumWalletCreated(false)}>
          Go back to main page
        </button>
      </div>
    </div>
  );
};

export default EthereumWalletGeneration;
