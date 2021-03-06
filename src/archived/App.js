// import React, { useState, useEffect, ErrorBoundary } from 'react';

// /* ERC71 based Solidity Contract Interface */
// import { FilGoodNFT721JSON, FilGoodNFT1155JSON } from '../utils/contracts';

// /* NFT.Storage import for creating an IPFS CID & storing with Filecoin */
// import { NFTStorage, File } from 'nft.storage';
// import { baseSVG } from '../utils/BaseSVG';

// /* Encryption package to ensure SVG data is not changed in the front-end before minting */
// import CryptoJS from 'crypto-js';

// /* Javascript Lib for evm-compatible blockchain contracts */
// import { ethers } from 'ethers';

// /* Custom Hooks */
// import useNFTStorage from '../api/useNFTStorage';

// /* UI Components & Style */
// // import ErrorPage from './pages/ErrorPage';
// import './styles/App.css';
// import {
//   Layout,
//   MintNFTInput,
//   StatusMessage,
//   ImagePreview,
//   Link,
//   DisplayLinks,
//   ConnectWalletButton,
//   NFTViewer
// } from '../components';
// // import InfoPage from "./pages/InfoPage";

// import { useMoralis, useApiContract } from 'react-moralis';

// import {
//   INITIAL_LINK_STATE,
//   INITIAL_TRANSACTION_STATE,
//   ipfsHttpGatewayLink,
//   NFT_METADATA_ATTRIBUTES,
//   CHAIN_MAPPINGS
// } from '../utils/consts';

// const jsonRpcOptions = {
//   functionName: 'getNFTCollection',
//   address: process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS_1155,
//   abi: FilGoodNFT1155JSON.abi,
//   chain: 'rinkeby'
//   // params: {}
//   // params: {
//   //   secondsAgos: [0, 10]
//   // }
// };

// const App = () => {
//   const [currentAccount, setCurrentAccount] = useState('');
//   const [name, setName] = useState('');
//   const [linksObj, setLinksObj] = useState(INITIAL_LINK_STATE);
//   const [imageView, setImageView] = useState(null);
//   const [remainingNFTs, setRemainingNFTs] = useState('');
//   const [recentlyMinted, setRecentlyMinted] = useState('');
//   // const [contractChoice, setcontractChoice] = useState("ERC721");
//   // const [chainChoice, setChainChoice] = useState("rinkeby");
//   const [transactionState, setTransactionState] = useState(INITIAL_TRANSACTION_STATE);
//   const [contractOptions, setContractOptions] = useState(jsonRpcOptions); //inludes chain choice and contract choice

//   const { loading, error, success } = transactionState; // make it easier

//   // this is to connect to our app and display pages even when no wallet is connected
//   const { Moralis, isInitialized, isInitializing } = useMoralis();
//   //these are functions I'll use to detect a wallet (without using moralis authenticate DB)
//   // const { web3, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();

//   useEffect(() => {
//     // Initialise the Blockchain Node server to get data from the blockchain
//     Moralis.start({
//       appId: process.env.REACT_APP_MORALIS_APP_ID,
//       serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL
//     });

//     checkIfWalletIsConnected();
//     // if (window.ethereum) {
//     //   // window.ethereum.on("accountsChanged", accountsChanged);
//     //   window.ethereum.on('chainChanged', chainChanged);
//     // }
//   }, []);

//   // useEffect(() => {
//   //   const { ethereum } = window;
//   //   if (!ethereum) {
//   //     // setIsConnected(false);
//   //     console.log('no wallet connected');
//   //     return;
//   //   } else {
//   //     // getWalletDetails();
//   //     ethereum.on('chainChanged', (chainId) => {
//   //       // location.reload();
//   //       console.log('new chain', chainId);
//   //     });
//   //     ethereum.on('accountsChanged', (accounts) => {
//   //       // location.reload();
//   //       console.log('new account', accounts);
//   //     });
//   //     // ethereum.on('');
//   //   }
//   // });

//   useEffect(() => {
//     console.log('no init');
//     if (isInitialized) {
//       console.log('init', isInitialized, FilGoodNFT1155JSON.abi); // <- is true
//       fetchNFTCollection();
//       // ALT:
//       // const fetchAndNotify = () => {
//       //   getRemainingNFTs({
//       //     onSuccess: (data) => console.log('success', data),
//       //     onError: (error) => console.log('error', error)
//       //   });
//       // };
//     }
//   }, [isInitialized]);

//   /* If a wallet is connected, do some setup and continue listening for wallet changes */
//   useEffect(() => {
//     setUpEventListener();
//     // chainChanged();
//   }, [currentAccount]);

//   /**
//    * This hook will load data from our NFT contract without a wallet being connected
//    * This is so that the page will load and display properly for any and all users
//    * They will need a wallet to Mint the NFTs though
//    */
//   const {
//     runContractFunction: fetchNFTCollection,
//     data: nftCollectionData,
//     error: nftCollectionError,
//     isLoading: nftCollectionIsLoading,
//     isFetching: nftCollectionIsFetching
//   } = useApiContract(jsonRpcOptions);
//   //also need to fetch remaining NFTs

//   /* Create the IPFS gateway URL's when the nft collection state changes */
//   useEffect(() => {
//     console.log('nftfetchthings', nftCollectionData);
//     if (nftCollectionData) {
//       createImageURLsForRetrieval(nftCollectionData);
//     }
//   }, [nftCollectionData]);

//   /* Check for a wallet */
//   //rename to isWalletConnected
//   const checkIfWalletIsConnected = async () => {
//     const { ethereum } = window;

//     if (!ethereum) {
//       // A wallet cannot be detected on the browser - we should give the user a visual
//       // letting them know they need a wallet to use this app / mint an NFT
//       console.log('Make sure you have metamask!, using default read-only provider');
//       return;
//     }

//     /** REMOVE ALL CODE BELOW HERE - checkIfWalletIsConnected should just check for ethereum obj
//      * We can ask use to connect wallet when they click the connect button
//      */
//     // checkChain();
//     setUpEventListener();

//     const accounts = await ethereum.request({ method: 'eth_accounts' });

//     if (accounts.length !== 0) {
//       setCurrentAccount(accounts[0]);
//     } else {
//       console.log('No authorized account found');
//     }

//     // TODO: make sure on right network or change programatically
//     const chainId = await ethereum.request({ method: 'eth_chainId' });
//     console.log(`Connected to chain ${chainId}`);

//     // String, hex code of the chainId of the Rinkebey test network
//     // const rinkebyChainId = '0x4';
//     // if (chainId !== rinkebyChainId) {
//     //   changeWalletChain();
//     //   // alert("You are not connected to the Rinkeby Test Network!");
//     // }
//   };

//   const isCorrectWalletChain = async () => {
//     //returns a boolean if this matches the contract
//   };

//   /* Connect a wallet */
//   const connectWallet = async () => {
//     try {
//       const { ethereum } = window;

//       if (!ethereum) {
//         alert('Get MetaMask!');
//         return;
//       }
//       const accounts = await ethereum.request({
//         method: 'eth_requestAccounts'
//       });
//       console.log('Connected', accounts[0]);
//       setCurrentAccount(accounts[0]);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const chainChanged = async () => {
//     const chainId = await window.ethereum.request({ method: 'eth_chainId' });
//     const rinkebyChainId = '0x4';
//     if (chainId !== rinkebyChainId) {
//       changeWalletChain();
//       // alert("You are not connected to the Rinkeby Test Network!");
//     } else return;
//   };

//   const changeWalletChain = async () => {
//     const provider = window.ethereum;
//     try {
//       await provider.request({
//         method: 'wallet_switchEthereumChain',
//         params: [{ chainId: '0x4' }]
//       });
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   /* Listens for events emitted from the solidity contract, to render data accurately
//     This should not rely on having a web wallet connection.
//   */
//   const setUpEventListener = async () => {
//     let provider = new ethers.providers.JsonRpcProvider([
//       process.env.REACT_APP_RINKEBY_RPC_URL,
//       'rinkeby'
//     ]);
//     const signer = provider.getSigner();
//     console.log('signer', signer);
//     const connectedContract = new ethers.Contract(
//       process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS,
//       FilGoodNFT1155JSON.abi,
//       signer
//     );
//     console.log('CONTRACT CONNECTED', connectedContract);

//     // fetchNFTCollection(connectedContract);
//     // await connectedContract
//     //   .nftCollection()
//     //   .then((collection) => {
//     //     console.log('collection', collection);
//     //     setNftCollectionData(collection); // update state
//     //   })
//     //   .catch((err) => console.log('error fetching nft collection data', err));

//     connectedContract.on('NewFilGoodNFTMinted', (sender, tokenId, tokenURI, remainingNFTs) => {
//       console.log('event - new minted NFT');
//       setLinksObj({
//         ...linksObj,
//         opensea: `https://testnets.opensea.io/assets/${
//           process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS
//         }/${tokenId.toNumber()}`,
//         rarible: `https://rinkeby.rarible.com/token/${
//           process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS
//         }:${tokenId.toNumber()}`
//       });
//       // fetchNFTCollection(connectedContract);
//       setRemainingNFTs(remainingNFTs);
//     });

//     // try {
//     //   const { ethereum } = window;

//     //   if (ethereum) {
//     //     const provider = new ethers.providers.Web3Provider(ethereum);
//     //     const signer = provider.getSigner();
//     //     const connectedContract = new ethers.Contract(
//     //       process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS,
//     //       FilGoodNFT1155JSON.abi,
//     //       signer
//     //     );
//     //     console.log('CONNECTED', connectedContract);

//     //     connectedContract.on('NewFilGoodNFTMinted', (sender, tokenId, tokenURI, remainingNFTs) => {
//     //       console.log('event - new minted NFT');
//     //       setLinksObj({
//     //         ...linksObj,
//     //         opensea: `https://testnets.opensea.io/assets/${
//     //           process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS
//     //         }/${tokenId.toNumber()}`,
//     //         rarible: `https://rinkeby.rarible.com/token/${
//     //           process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS
//     //         }:${tokenId.toNumber()}`
//     //       });
//     //       // fetchNFTCollection();
//     //       setRemainingNFTs(remainingNFTs);
//     //     });
//     //   } else {
//     //     console.log("Ethereum object doesn't exist!");
//     //   }
//     // } catch (error) {
//     //   console.log(error);
//     // }
//   };

//   /* Helper function for createNFTData */
//   const resetState = () => {
//     setLinksObj(INITIAL_LINK_STATE);
//     setName('');
//     setImageView(null);
//   };

//   /* Create the IPFS CID of the json data */
//   const createNFTData = async () => {
//     // check if user has wallet connected & ready (connect & useCallback otherwise)
//     // check if user is on right chain (change and useCallback otherwise)
//     console.log('saving to NFT storage');
//     resetState();
//     setTransactionState({
//       ...INITIAL_TRANSACTION_STATE,
//       loading: 'Creating NFT data to save to NFT.Storage...'
//     });

//     const imageData = CryptoJS.AES.encrypt(
//       `${baseSVG}${name}</tspan></text></g></svg>`,
//       process.env.REACT_APP_ENCRYPT_KEY
//     );
//     const nftJSON = {
//       nftName: `${name}: ${NFT_METADATA_ATTRIBUTES.nftName}`,
//       nftDescription: NFT_METADATA_ATTRIBUTES.description,
//       nftData: imageData,
//       nftDataType: NFT_METADATA_ATTRIBUTES.fileType,
//       nftDataName: NFT_METADATA_ATTRIBUTES.fileName,
//       traits: {
//         awesomeness: '100'
//       }
//     };

//     saveToNFTStorage(nftJSON);

//     // createImageView(nftMetadata);
//     // askContractToMintNft(nftMetadata.url);
//   };

//   const {
//     saveToNFTStorage,
//     data: nftMetadata,
//     error: nftStorageError,
//     isLoading: isSavingToNftStorage
//   } = useNFTStorage();

//   useEffect(() => {
//     if (isSavingToNftStorage) {
//       setTransactionState({
//         ...INITIAL_TRANSACTION_STATE,
//         loading: 'Saving NFT data to NFT.Storage...'
//       });
//     } else if (nftStorageError) {
//       setTransactionState({
//         ...INITIAL_TRANSACTION_STATE,
//         error: `Could not save NFT to NFT.Storage - Aborted minting: \n ${nftStorageError.message}`
//       });
//     } else if (nftMetadata) {
//       console.log('nftMetadata', nftMetadata);
//       createImageView(nftMetadata);
//       askContractToMintNft(nftMetadata.url);
//       setTransactionState({
//         ...INITIAL_TRANSACTION_STATE,
//         success: (
//           <>
//             <div>
//               Saved NFT data to NFT.Storage...!! We created an IPFS CID & made Filecoin Storage
//               Deals with one call!
//             </div>
//             File: <a>{nftMetadata.url}</a>
//           </>
//         )
//       });
//     }
//   }, [nftMetadata, nftStorageError, isSavingToNftStorage]);

//   const saveToNFTStorage1 = async ({
//     nftName,
//     nftDescription,
//     nftData,
//     nftDataType,
//     nftDataName
//   }) => {
//     setTransactionState({
//       ...INITIAL_TRANSACTION_STATE,
//       loading: 'Saving NFT data to NFT.Storage...'
//     });
//     const client = new NFTStorage({
//       token: process.env.REACT_APP_NFT_STORAGE_API_KEY
//     });

//     await client
//       .store({
//         name: nftName,
//         description: nftDescription,
//         image: new File(
//           [
//             CryptoJS.AES.decrypt(nftData, process.env.REACT_APP_ENCRYPT_KEY).toString(
//               CryptoJS.enc.Utf8
//             )
//           ],
//           nftDataName,
//           {
//             type: nftDataType
//           }
//         ),
//         traits: {
//           awesomeness: '100'
//         }
//       })
//       .then((metadata) => {
//         setTransactionState({
//           ...INITIAL_TRANSACTION_STATE,
//           success: `Saved NFT data to NFT.Storage...!! We created an IPFS CID & made a Filecoin Storage Deal with one call!
//             ${metadata.url}`
//         });
//         createImageView(metadata);
//         askContractToMintNft(metadata.url);
//       })
//       .catch((error) => {
//         setTransactionState({
//           ...INITIAL_TRANSACTION_STATE,
//           error: `Could not save NFT to NFT.Storage - Aborted minting: \n ${error}`
//         });
//       });
//   };

//   /* Helper function for createNFTData */
//   const createImageView = (metadata) => {
//     console.log('creating image view', metadata);
//     const imgViewArray = metadata.data.image.pathname.split('/');
//     const imgViewString = `https://${imgViewArray[2]}${ipfsHttpGatewayLink}${imgViewArray[3]}`;
//     setImageView(imgViewString);
//     console.log(
//       'image view set',
//       `https://${imgViewArray[2]}${ipfsHttpGatewayLink}${imgViewArray[3]}`
//     );
//   };

//   /* Mint the NFT on the rinkeby eth blockchain */
//   const askContractToMintNft = async (IPFSurl) => {
//     // should check the wallet chain is correct here
//     setTransactionState({
//       ...INITIAL_TRANSACTION_STATE,
//       loading: 'Approving & minting NFT...'
//     });

//     //let's remove this code so it's more generic
//     const { ethereum } = window;

//     if (ethereum) {
//       const provider = new ethers.providers.Web3Provider(ethereum);
//       // should check a wallet is connected and it is on the correct chain here.
//       console.log('provider', provider);
//       // A Signer in ethers is an abstraction of an Ethereum Account, which can be used to
//       // sign messages and transactions and send signed transactions to the Ethereum Network
//       // to execute state changing operations.
//       const signer = provider.getSigner();
//       const connectedContract = new ethers.Contract(
//         process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS_1155,
//         FilGoodNFT1155JSON.abi,
//         signer
//       );

//       console.log('Opening wallet');
//       // TODO: fix THIS CODE IS FAR TOO HARD TO READ
//       await connectedContract
//         .mintMyNFT(IPFSurl)
//         .then(async (data) => {
//           console.log('nftTxn data', data);
//           await data
//             .wait()
//             .then((tx) => {
//               console.log('nft minted tx', tx, tx.logs);
//               //refetchNFTs here - ideally want a listener on this event though
//               // fetchNFTCollection();
//               setLinksObj({
//                 ...linksObj,
//                 etherscan: `https://rinkeby.etherscan.io/tx/${data.hash}`
//               });
//               setTransactionState({
//                 ...INITIAL_TRANSACTION_STATE,
//                 success: `NFT Minted!`
//               });
//             })
//             .catch((error) => {
//               setTransactionState({
//                 ...INITIAL_TRANSACTION_STATE,
//                 error: `Error Minting NFT. ${error.message}`
//               });
//             });
//         })
//         .catch((err) => {
//           console.log('err', err);
//           setTransactionState({
//             ...INITIAL_TRANSACTION_STATE,
//             error: `Error Minting NFT. ${err.message}`
//           });
//         });
//     } else {
//       console.log("Ethereum object doesn't exist!");
//       setTransactionState({
//         ...INITIAL_TRANSACTION_STATE,
//         error: `No Wallet connected`
//       });
//     }
//   };

//   /* Helper function - manipulating the returned CID into a http link using IPFS gateway */
//   const createIPFSgatewayLink = (el) => {
//     const link = el[1].split('/');
//     const fetchURL = `https://${link[2]}.ipfs.nftstorage.link/${link[3]}`;
//     return fetchURL;
//   };

//   /*
//     Helper function for fetching the Filecoin data through IPFS gateways
//     to display the images in the UI
//   */
//   const createImageURLsForRetrieval = async (collection) => {
//     if (collection.length < 1) return;
//     // only return the 5 most recent NFT images
//     // this collection is fetched on webpage load
//     const dataCollection = collection
//       .slice()
//       .reverse()
//       .slice(0, 5)
//       .map((el) => {
//         return el;
//       });

//     const imgURLs = await Promise.all(
//       dataCollection.map(async (el) => {
//         const ipfsGatewayLink = createIPFSgatewayLink(el);
//         console.log('fetchURL', ipfsGatewayLink);
//         const response = await fetch(ipfsGatewayLink);
//         const json = await response.json();
//         return json;
//       })
//     );

//     console.log('imgURLs2', imgURLs);
//     setRecentlyMinted(imgURLs);
//   };

//   /* Render our page */
//   return (
//     // <ErrorBoundary FallbackComponent={ErrorPage}>
//     <Layout connected={currentAccount === ''} connectWallet={connectWallet}>
//       <>
//         <p className="sub-sub-text">{`Remaining NFT's: ${remainingNFTs}`}</p>
//         {transactionState !== INITIAL_TRANSACTION_STATE && (
//           <StatusMessage status={transactionState} />
//         )}
//         {imageView && !linksObj.etherscan && (
//           <Link link={imageView} description="See IPFS image link" />
//         )}
//         {imageView && <ImagePreview imgLink={imageView} preview="true" />}
//         {linksObj.etherscan && <DisplayLinks linksObj={linksObj} />}
//         {currentAccount === '' ? (
//           <ConnectWalletButton connectWallet={connectWallet} />
//         ) : transactionState.loading ? (
//           <div />
//         ) : (
//           <MintNFTInput
//             name={name}
//             setName={setName}
//             transactionState={transactionState}
//             createNFTData={createNFTData}
//           />
//         )}
//         {recentlyMinted && <NFTViewer recentlyMinted={recentlyMinted} />}
//         {/* <InfoPage connected={currentAccount === ""} connectWallet={connectWallet} /> */}
//       </>
//     </Layout>
//     // </ErrorBoundary>
//   );
// };

// export default App;
