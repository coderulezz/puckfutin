import React, { useEffect, useContext, useState } from 'react';
import { Context } from './store/Store';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import FuckPutin from './contracts/FuckPutin.json';
import ConnectWallet from './store/ConnectWallet';
import { ethers } from 'ethers';
import MerkleTree from 'merkletreejs';
import keccak256 from 'keccak256';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from './config';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: '676d8aa76fe845079b250f53ba2c096f' // required
    }
  }
};

const web3Modal = new Web3Modal({
  network: 'mainnet', // @TODO - before deploy
  cacheProvider: true, // optional
  providerOptions // required
});

function generateLeaf(address, value) {
  return Buffer.from(
    // Hash in appropriate Merkle format
    ethers.utils.solidityKeccak256(['address', 'uint256'], [address, value]).slice(2),
    'hex'
  );
}

const merkleTree = new MerkleTree(
  // Generate leafs
  Object.entries(config.airdrop).map(([address, tokens]) =>
    generateLeaf(
      ethers.utils.getAddress(address),
      ethers.utils.parseUnits(tokens.toString(), config.decimals).toString()
    )
  ),
  // Hashing function
  keccak256,
  { sortPairs: true }
);

const Claim = () => {
  const [state, dispatch] = useContext(Context);
  const [loadingData, setLoadingData] = useState(false);
  const [numTokens, setNumTokens] = useState(0);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const loadBlockchainData = async (web3) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    // Load chain information over an HTTP API
    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();
    if (accounts[0]) {
      const networkData = FuckPutin.networks[chainId];
      if (networkData) {
        const abi = FuckPutin.abi;
        const address = networkData.address;
        const contract = new web3.eth.Contract(abi, address);
        dispatch({
          type: 'SET_CONTRACT',
          payload: contract
        });
        dispatch({
          type: 'SET_ACCOUNT',
          payload: { wallet: accounts[0], chainId: chainId }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Wrong network' });
      }
    }
  };

  const connect = async () => {
    const provider = await web3Modal.connect();

    if (!provider.on) {
      return;
    }
    provider.on('close', resetApp);
    provider.on('accountsChanged', async (accounts) => {
      dispatch({ type: 'CLEAR_ACCOUNT' });
      return await loadBlockchainData(new Web3(provider));
    });
    provider.on('chainChanged', async (chainId) => {
      dispatch({ type: 'CLEAR_ACCOUNT' });
      return await loadBlockchainData(new Web3(provider));
    });

    provider.on('networkChanged', async (networkId) => {
      dispatch({ type: 'CLEAR_ACCOUNT' });
      return await loadBlockchainData(new Web3(provider));
    });

    await loadBlockchainData(new Web3(provider));
  };

  const resetApp = async () => {
    await web3Modal.clearCachedProvider();
    dispatch({ type: 'CLEAR_ACCOUNT' });
  };

  useEffect(() => {
    dispatch({ type: 'SET_CONNECTION', payload: connect });
    dispatch({ type: 'SET_DISCONNECTION', payload: resetApp });
    if (web3Modal.cachedProvider) {
      connect();
    }
    // eslint-disable-next-line
  }, []);

  const { wallet: address, minAddress } = state.account || {};

  const syncStatus = async () => {
    // Toggle loading
    setLoadingData(true);

    // Force authentication
    if (address && state.contract) {
      // Collect number of tokens for address
      console.log('address', address);
      const tokens = getAirdropAmount(address);
      console.log('tokens', tokens);
      setNumTokens(tokens);

      // Collect claimed status for address, if part of airdrop (tokens > 0)
      if (tokens > 0) {
        const claimed = await getClaimedStatus(address);
        setAlreadyClaimed(claimed);
      }
    } else {
      setAlreadyClaimed(false);
      setNumTokens(0);
    }

    // Toggle loading
    setLoadingData(false);
  };

  const claimWithLoading = async () => {
    setButtonLoading(true); // Toggle
    if (!address) {
      throw new Error('Not Authenticated');
    }

    // Collect token contract
    const { contract: token } = state;
    // Get properly formatted address
    const formattedAddress = ethers.utils.getAddress(address);
    // Get tokens for address
    const numTokens = ethers.utils
      .parseUnits(
        (
          config.airdrop[formattedAddress] ||
          config.airdrop[address] ||
          config.airdrop[formattedAddress.toLowerCase()]
        ).toString(),
        config.decimals
      )
      .toString();

    // Generate hashed leaf from address
    const leaf = generateLeaf(formattedAddress, numTokens);
    // Generate airdrop proof
    const proof = merkleTree.getHexProof(leaf);

    // Try to claim airdrop and refresh sync status
    try {
      await token.methods
        .claim(formattedAddress, numTokens, proof)
        .send({ from: formattedAddress })
        .once('receipt', async (receipt) => {
          console.log(receipt);
          await syncStatus();
          setButtonLoading(false);

          toast.success('Done', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          });
        })
        .once('error', async (error) => {
          toast.error(error.message, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          });
          await syncStatus();
          setButtonLoading(false);
        });
    } catch (e) {
      setButtonLoading(false);
      toast.error(e.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
      console.error(`Error when claiming tokens: ${e}`);
    }
    setButtonLoading(false); // Toggle
  };

  const getClaimedStatus = async (address) => {
    return await state.contract.methods
      .hasClaimed(ethers.utils.getAddress(address))
      .call();
  };

  const getAirdropAmount = (address) => {
    // If address is in airdrop
    if (address in config.airdrop) {
      // Return number of tokens available
      return config.airdrop[address];
    }

    if (address.toLowerCase() in config.airdrop) {
      // Return number of tokens available
      return config.airdrop[address.toLowerCase()];
    }

    // Else, return 0 tokens
    return 0;
  };

  useEffect(() => {
    syncStatus();
    // eslint-disable-next-line
  }, [state.account, state.contract]);

  return (
    <div className="container page">
      <div className="row">
        <div className="col-md-4 step-container">
          <div className="step">
            <p>Step 1</p>
            <hr />
            <p className="step-description">CONNECT YOUR WALLET</p>
            <ConnectWallet />
          </div>
        </div>
        <div className="col-md-4 step-container">
          <div className="step">
            <p>Step 2</p>
            <hr />
            <p className="step-description">ESTIMATE REWARD</p>
            {state.account ? (
              loadingData ? (
                <div style={{ marginBottom: 24 }}>
                  <p className="reward">Loading airdrop details...</p>
                  <p className="reward">
                    Please hold while we collect details about your address.
                  </p>
                </div>
              ) : numTokens === 0 ? (
                <div style={{ marginBottom: 24 }}>
                  <p className="reward">
                    Unfortunately, your address does not qualify for the airdrop.
                  </p>
                </div>
              ) : alreadyClaimed ? (
                <div style={{ marginBottom: 24 }}>
                  <p className="reward">
                    Your address ({minAddress}) has already claimed {numTokens * 0.95}{' '}
                    tokens.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <p className="reward">Your donation:</p>
                    <p className="reward">
                      {(numTokens / 2700).toString().match(/^-?\d+(?:\.\d{0,6})?/)} ETH
                    </p>
                  </div>
                  <div>
                    <p className="reward">Your reward:</p>
                    <p className="reward">{numTokens * 0.95} $FPC</p>
                  </div>
                </>
              )
            ) : (
              <div style={{ marginBottom: 24 }}>
                <p className="reward">
                  Please connect with your wallet to check your airdrop.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-4 step-container">
          <div className="step">
            <p>Step 3</p>
            <hr />
            <p className="step-description">
              {alreadyClaimed ? 'DONE' : 'INITIATE CLAIM'}
            </p>
            {state.account && !loadingData && numTokens > 0 && !alreadyClaimed && (
              <button
                className="button small-button"
                onClick={claimWithLoading}
                disabled={buttonLoading}
              >
                {buttonLoading ? 'Claiming $FPC...' : 'Claim $FPC'}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="fixed-bottom">
        <div className="row">
          <div className="col-md-5">
            <p className="disclaimer">
              Fuck Putin Coin has no value is and meant to be a joke. This is not an
              investment. But best wishes on buying a seized oligarch yacht.
            </p>
          </div>
        </div>
      </div>
      <img
        alt="Rainbow"
        src="rainbow.png"
        className="fixed-bottom footer-image"
        style={{ width: '40%' }}
      />
      <img
        alt="Futin"
        src="futin.png"
        className="fixed-bottom footer-image"
        style={{ width: '40%' }}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Claim;
