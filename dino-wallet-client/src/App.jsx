import { useState, useEffect } from "react"
import AppBar from "../components/AppBar"
import Footer from "../components/Footer"
import Home from "../components/Home"
import SolanaWalletGeneration from "../components/SolanaWalletGeneration"
import EthereumWalletGeneration from '../components/EthereumWalletGeneration'

import { Buffer } from 'buffer';
window.Buffer = Buffer; // This makes Buffer globally available


function App() {
  const [isSolanaWalletCreated, setIsSolanaWalletCreated] = useState(false);
  const [numberOfSolanaAccounts, setNumberOfSolanaAccounts] = useState(0);
  const [listOfSolanaAccounts, setListOfSolanaAccounts] = useState([]);

  const [isEthereumWalletCreated, setIsEthereumWalletCreated] = useState(false);
  const [numberOfEthereumAccounts, setNumberOfEthereumAccounts] = useState(0);
  const [listOfEthereumAccounts, setListOfEthereumAccounts] = useState([]);

  useEffect(() => {
    const seedPhrase = localStorage.getItem("solanaWalletSeedPhrase");
    if (seedPhrase) {
      setIsSolanaWalletCreated(true); // Set true if seed phrase exists
    }
  }, []);

  useEffect(() => {
    const seedPhrase = localStorage.getItem("ethereumWalletSeedPhrase");
    if (seedPhrase) {
      setIsEthereumWalletCreated(true); // Set true if seed phrase exists
    }
  }, []);

  // Function to render the appropriate component based on wallet creation status
  const renderWalletComponent = () => {
    if (!isSolanaWalletCreated && !isEthereumWalletCreated) {
      return (
        <Home
          numberOfSolanaAccounts={numberOfSolanaAccounts}
          setNumberOfSolanaAccounts={setNumberOfSolanaAccounts}
          setIsSolanaWalletCreated={setIsSolanaWalletCreated}
          setListOfSolanaAccounts={setListOfSolanaAccounts}
          numberOfEthereumAccounts={numberOfEthereumAccounts}
          setNumberOfEthereumAccounts={setNumberOfEthereumAccounts}
          setIsEthereumWalletCreated={setIsEthereumWalletCreated}
          setListOfEthereumAccounts={setListOfEthereumAccounts}
        />
      );
    } else if (isSolanaWalletCreated) {
      return (
        <SolanaWalletGeneration
          listOfSolanaAccounts={listOfSolanaAccounts}
          setListOfSolanaAccounts={setListOfSolanaAccounts}
          numberOfSolanaAccounts={numberOfSolanaAccounts}
          setNumberOfSolanaAccounts={setNumberOfSolanaAccounts}
          setIsSolanaWalletCreated={setIsSolanaWalletCreated}
        />
      );
    } else if (isEthereumWalletCreated) {
      return (
        <EthereumWalletGeneration
          listOfEthereumAccounts={listOfEthereumAccounts}
          setListOfEthereumAccounts={setListOfEthereumAccounts}
          numberOfEthereumAccounts={numberOfEthereumAccounts}
          setNumberOfEthereumAccounts={setNumberOfEthereumAccounts}
          setIsEthereumWalletCreated={setIsEthereumWalletCreated}
        />
      );
    }
    return null; // In case no conditions match
  };

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
      {renderWalletComponent()} {/* Render the appropriate component */}
      <Footer />
    </div>
  );
}

export default App
