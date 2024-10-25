    import React from "react";
    import { generateMnemonic, mnemonicToSeedSync } from "bip39";
    import nacl from 'tweetnacl';
    import { derivePath } from 'ed25519-hd-key';
    import { Keypair } from '@solana/web3.js'
    import { Wallet, HDNodeWallet } from "ethers";

    const Home = ({ numberOfSolanaAccounts, setNumberOfSolanaAccounts, setIsSolanaWalletCreated, setListOfSolanaAccounts, numberOfEthereumAccounts, setNumberOfEthereumAccounts, setIsEthereumWalletCreated, setListOfEthereumAccounts }) => {
        const handleGenerateSolanaWallet = () => {
          let seedPhrase = null;
          //if seedPhrase not present then generate
          if (!localStorage.getItem("solanaWalletSeedPhrase")) {
            seedPhrase = generateMnemonic();
            localStorage.setItem("solanaWalletSeedPhrase", seedPhrase); // Store the generated seed phrase
          }
          else {
            seedPhrase = localStorage.getItem("solanaWalletSeedPhrase");
          }
          //generate wallet, generate 1 account, shift to display each of the SolanaWalletGeneration Pages separately 
          console.log("Generated Seed Phrase:", seedPhrase);
          const seed = mnemonicToSeedSync(seedPhrase); //converts the generated mnemonic to the seed
          console.log(seed);

          //logic to generate solana accounts under the main HD Wallet below for the given seed above
          const path = `m/44'/501'/${numberOfSolanaAccounts}'/0'`; //setting the derivation path for the first account below
          console.log(
            `\nDerivation Path for Account ${numberOfSolanaAccounts}:`,
            path
          ); //be careful with the string literals inside the path, very sensitive

          //derive a specific key (seed) for the given path to enable hd wallets
          const derivedSeed = derivePath(path, seed.toString("hex")).key;
          console.log(
            `Derived Seed (hex) for Account ${numberOfSolanaAccounts}:`,
            derivedSeed.toString("hex")
          ); //it converts buffer with binary data or uint8 array into hexadecimal format

          //generate a secret/private key from the derived seed as we are using HD Wallets here
          const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);
          const secretKey = keyPair.secretKey; //this is the private key
          const publicKey = Keypair.fromSecretKey(secretKey).publicKey; //from secret/private key generate the public key

          // Log the private (secret) key and public key
          console.log(
            `Private Key (hex) for Account ${numberOfSolanaAccounts}:`,
            Buffer.from(secretKey).toString("hex")
          );
          console.log(
            `Public Key (Base58) for Account ${numberOfSolanaAccounts}:`,
            publicKey.toBase58()
          );

          //add the account number, public key and private key as an object to solana wallets list
          setListOfSolanaAccounts((prevAccounts) => [
            ...prevAccounts,
            {
              accountNumber: numberOfSolanaAccounts,
              publicKey: publicKey.toBase58(),
              privateKey: Buffer.from(secretKey).toString("hex"),
              balance: null
            },
          ]);

          //increase the number of accounts by 1
          setNumberOfSolanaAccounts((prevCount) => prevCount + 1);
          console.log(
            `The number of accounts now is ${numberOfSolanaAccounts}`
          );

          //Shift to SolanaWalletGenerationPage separately and set the seed phrase to it
          // Store the seed phrase in local storage
          localStorage.setItem("solanaWalletSeedPhrase", seedPhrase);
          setIsSolanaWalletCreated(true);
        }

        const handleGenerateEthereumWallet = () => { 
          let seedPhrase = null;
          //if seedPhrase not present then generate
          if (!localStorage.getItem("ethereumWalletSeedPhrase")) {
            seedPhrase = generateMnemonic();
            localStorage.setItem("ethereumWalletSeedPhrase", seedPhrase); // Store the generated seed phrase
          } else {
            seedPhrase = localStorage.getItem("ethereumWalletSeedPhrase");
          }
          //generate wallet, generate 1 account, shift to display each of the EthereumWalletGeneration Pages separately
          console.log("Generated Seed Phrase:", seedPhrase);
          const seed = mnemonicToSeedSync(seedPhrase); //converts the generated mnemonic to the seed
          console.log(seed);

          //logic to generate ethereum accounts under the main HD Wallet below for the given seed above
          const path = `m/44'/60'/${numberOfEthereumAccounts}'/0'`; //setting the derivation path for the first account below
          console.log(
            `\nDerivation Path for Account ${numberOfEthereumAccounts}:`,
            path
          ); //be careful with the string literals inside the path, very sensitive

          // //derive a specific key (seed) for the given path to enable hd wallets
          // const derivedSeed = derivePath(path, seed.toString("hex")).key;
          // console.log(
          //   `Derived Seed (hex) for Account ${numberOfSolanaAccounts}:`,
          //   derivedSeed.toString("hex")
          // ); //it converts buffer with binary data or uint8 array into hexadecimal format

          // //generate a secret/private key from the derived seed as we are using HD Wallets here
          // const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);
          // const secretKey = keyPair.secretKey; //this is the private key
          // const publicKey = Keypair.fromSecretKey(secretKey).publicKey; //from secret/private key generate the public key

          const hdNode = HDNodeWallet.fromSeed(seed); //create a hd wallet instance from the seed generated above
          const child = hdNode.derivePath(path); //derive a child wallet from hd node using a specific derivation path
          const secretKey = child.privateKey; //extract the private key from the derived child wallet
          const publicKey = child.address //generate public key from child wallet's private key
          // const wallet = new Wallet(secretKey); //create a new wallet instance using the private key

          // Log the private (secret) key and public key
          console.log(
            `Private Key (hex) for Account ${numberOfEthereumAccounts}:`,
            secretKey
          );
          console.log(
            `Public Key (Base58) for Account ${numberOfEthereumAccounts}:`,
            publicKey
          );

          //add the account number, public key and private key as an object to solana wallets list
          setListOfEthereumAccounts((prevAccounts) => [
            ...prevAccounts,
            {
              accountNumber: numberOfEthereumAccounts,
              publicKey: publicKey,
              privateKey: secretKey,
              balance: null,
            },
          ]);

          //increase the number of accounts by 1
          setNumberOfEthereumAccounts((prevCount) => prevCount + 1);
          console.log(
            `The number of accounts now is ${numberOfEthereumAccounts}`
          );

          //Shift to EthereumWalletGenerationPage separately and set the seed phrase to it
          // Store the seed phrase in local storage
          localStorage.setItem("ethereumWalletSeedPhrase", seedPhrase);
          setIsEthereumWalletCreated(true);

        }

        return (
            <div style={{height: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: "center", gap: '10px'}}> 
            <button onClick={handleGenerateSolanaWallet}>Generate Solana Wallet</button>
            <button onClick={handleGenerateEthereumWallet}>Generate Ethereum Wallet</button>
            </div>
        );
    };

    export default Home;
