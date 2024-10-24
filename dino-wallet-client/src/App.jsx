import { useState, useEffect } from "react"
import AppBar from "../components/AppBar"
import Footer from "../components/Footer"
import Home from "../components/Home"
import SolanaWalletGeneration from "../components/SolanaWalletGeneration"

import { Buffer } from 'buffer';
window.Buffer = Buffer; // This makes Buffer globally available


function App() {

  const [isSolanaWalletCreated, setIsSolanaWalletCreated] = useState(false) 
  const [numberOfSolanaAccounts, setNumberOfSolanaAccounts] = useState(0);
  const [listOfSolanaAccounts, setListOfSolanaAccounts] = useState([]);

  useEffect(() => {
    const seedPhrase = localStorage.getItem("solanaWalletSeedPhrase");
    if (seedPhrase) {
      setIsSolanaWalletCreated(true); // Set true if seed phrase exists
    }
  }, []);


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <AppBar />
      {!isSolanaWalletCreated ? (
        <Home
          numberOfSolanaAccounts={numberOfSolanaAccounts}
          setNumberOfSolanaAccounts={setNumberOfSolanaAccounts}
          setIsSolanaWalletCreated={setIsSolanaWalletCreated}
          setListOfSolanaAccounts={setListOfSolanaAccounts}
        />
      ) : (
        <SolanaWalletGeneration
          listOfSolanaAccounts={listOfSolanaAccounts}
          setListOfSolanaAccounts={setListOfSolanaAccounts}
          numberOfSolanaAccounts={numberOfSolanaAccounts}
          setNumberOfSolanaAccounts={setNumberOfSolanaAccounts}
          setIsSolanaWalletCreated={setIsSolanaWalletCreated}
        />
      )}
      <Footer />
    </div>
  );
}

export default App
