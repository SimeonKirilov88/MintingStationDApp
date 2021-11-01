import React from 'react'
import { useEffect, useState, useRef } from 'react'
import Web3 from "web3"
import { FullPage, Slide } from 'react-full-page'
import ReactPlayer from 'react-player'
import { ToastContainer, toast } from "react-toastify";
import swal from "sweetalert";
import { contractAbi, contractAddress } from './config'
import tokenSlider from './components/tokenSlider'
import styled from 'styled-components'

import { Image, Button, Container, Row, Col, Card, Text } from 'react-bootstrap'
import thirdImage from './assets/third-section.jpeg'
import sectionVideo from './assets/Output.gif'
import line1 from './assets/line1.png'
import line2 from './assets/line2.png'
import line3 from './assets/line3.png'
import line4 from './assets/line4.png'
import line5 from './assets/line5.png'
import line6 from './assets/line6.png'
import line7 from './assets/line7.png'
import line8 from './assets/line8.png'

import Header from './components/Header'
import Footer from './components/Footer'
import Roadmap from './components/roadmap'

// Custom Style
import './App.css'

const StyledPadding = styled.div`
  padding-top: 8px;
  padding-bottom: 8px;
`
const StyledCard = styled(Card)`
  width: 60%;
  background: linear-gradient(111.68deg, rgb(242, 236, 242) 0%, rgb(232, 242, 246) 100%);
  box-shadow: rgb(0 152 161) 0px 0px 0px 1px, rgb(31 199 212 / 40%) 0px 0px 4px 8px;
  border-radius: 24px;
  padding: 24px;
  align-items: center;
  font-size: 24px;
  height: fit-content;
  padding-top: 64px;
  
`

const App = () => {

  const [chainId, setChainId] = useState(null);
  const [method, setMethod] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [price, setPrice] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  let [mintNum, setMintNum] = useState(1);
  const api = "https://supbirds.com/meta/";

  useEffect(async () => {
    loadWeb3();
  }, []);

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        loadBlockchainData();
        getCurrentAddressConnected();
        addAccountsAndChainListener();
      } catch (error) {
        console.error(error);
      }
    } else {
      swal(
        "",
        "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!",
        "error"
      );
    }
  }
  const loadBlockchainData = async () => {
    const contract = new window.web3.eth.Contract(contractAbi, contractAddress);
    setContract(contract);
    const chainId = await window.web3.eth.getChainId();
    setChainId(chainId);
    {
      chainId === 4 ? setMethod("success") : setMethod("error");
    }
    // method && fireToast()

    // if (chainId === 1) {
    const totalSupply = await contract.methods.totalSupply().call();
    setTotalSupply(totalSupply);
    
    const price = await contract.methods.cost().call();
    setPrice(price);
    const displayPrice = window.web3.utils.fromWei(price, "ether");
    setDisplayPrice(displayPrice);

    const maxSupply = await contract.methods.maxSupply().call();
    setMaxSupply(maxSupply);

    //event will be fired by the smart contract when a new PetPal is minted
    contract.events
      .Mint()
      .on("data", async function (result) {
        setTotalSupply(result.returnValues[1]);
      })
      .on("error", console.error);
    // }
  };

  const getCurrentAddressConnected = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addAccountsAndChainListener = async () => {
    //this event will be emitted when the currently connected chain changes.
    window.ethereum.on("chainChanged", (_chainId) => {
      window.location.reload();
    });

    // this event will be emitted whenever the user's exposed account address changes.
    window.ethereum.on("accountsChanged", (accounts) => {
      window.location.reload();
    });
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        document.getElementById("connectButton").disabled = true;
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        document.getElementById("connectButton").disabled = false;
        setAccount(accounts[0]);
        method && fireToast();
      } catch (error) {
        if (error.code === 4001) {
          swal("Request to access account denied!", "", "error");
        }
        document.getElementById("connectButton").disabled = false;
      }
    }
  };
  
  async function mint(mintCount) {
    if (contract) {
      // console.log('debug->contract', contract)
      // if (chainId === 1) {
      if (mintCount === 0) {
        swal("Minimum mint amount is 1 PetPal", "", "info");
      } else {
        try {
          const finalPrice = Number(price) * mintCount;
          console.log('debug->here', account, finalPrice)
          await contract.methods
            .mint(account, mintCount)
            .send({ from: account, value: finalPrice });
        } catch (error) {
          if (error.code === 4001) {
            swal("Transaction Rejected!", "", "error");
          } else {
            swal("Transaction Failed!", "", "error");
          }
        }
      }
      // } else {
      //   swal("Please switch to mainnet to mint PetPal", "", "error");
      // }
    } else {
      swal(
        "",
        "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!",
        "error"
      );
    }
  }

  function handleMinus() {
    // let newNum = 1
    // if(mintNum >= 2)
    //   newNum = mintNum-1;
    // setMintNum(newNum);
    if(mintNum >= 2)
      setMintNum(mintNum - 1)
  }

  function handlePlus() {
    // const nuwNum = mintNum + 1;
    // setMintNum(nuwNum);
    setMintNum(mintNum + 1)
  }
  const fireToast = () => {
    toast[method](
      `You are ${method === "error" ? "not" : ""} connected to mainnet`,
      {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
      }
    );
  };

  return (
    <FullPage controls={false}>
      <Header />

      {/* Section 1 */}
      <Slide className='top__section' id='home'>
        <div className='container'>
          {/* <div className='row text-center'> */}
            {/* <div className='col-md-9 m-auto'> */}
              <StyledCard className='mintCard'>
                <h1>{totalSupply}/{maxSupply}</h1>
                <p className='sub__heading'>
                  {contractAddress.slice(0, 7) + '...' + contractAddress.slice(contractAddress.length - 4)}
                </p>
                <p className='sub__heading'>
                  1 RIZK costs {price / 10**18 } ETH
                </p>
                <p className='sub__heading'>
                  Click buy to mint your NFT
                </p>
                <div class="qty mt-1">
                  <span class="minus bg-dark" onClick={() => handleMinus()}>-</span>
                  <input type="number" class="count" name="qty" value={mintNum} />
                  <span class="plus bg-dark" onClick={()=>handlePlus()}>+</span>
                </div>
                <StyledPadding />
                {/* {account? <Button variant='primary' onClick={() =>mint(mintNum)}>Mint a RIZK</Button> : 
                <Button variant='primary' id='connectButton' onClick={connectMetaMask}>Connect Wallet</Button>} */}
                <Button variant='primary' onClick={() =>mint(mintNum)}>Mint a RIZK</Button>
              </StyledCard>
            {/* </div> */}
          {/* </div> */}
        </div>
      </Slide>

      {/* Section 2 */}
      <Slide className='second__section' id='rizk'>
        <div className='container'>
          <div className='row'>
            <div className='col-md-6 content'>
              <h2>About the RIZK</h2>
              <p className='content'>
                RIZK are 10,000 professional RIZK
                competing on the blockchain for supremacy. 
              </p>
              <Button variant='primary' onClick={() =>mint(mintNum)}>Mint a RIZK</Button>
            </div>
            <div className='col-md-6 video'>
              <tokenSlider />
              {/* <ReactPlayer
                url={sectionVideo}
                controls={false}
                playing={true}
                muted={true}
                loop={true}
                width='auto'
                style={{ textAlign: 'center' }}
              /> */}
            </div>
          </div>
        </div>
      </Slide>

      {/* Section 3 */}
      <Slide className='third__section' id='distribution'>
        <Container>
          <Row>
            <Col md={5}>
              <Image src={thirdImage} fluid />
            </Col>
            <Col md={7}>
              <h2>Rarity</h2>
              <ul>
                <li>0.08 Eth</li>
                <li>2.5% royalty</li>
                <li>No bonding curve</li>
                <li>ERC-721</li>
                <li>IPFS stored</li>
              </ul>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse porta cursus turpis, vel accumsan massa accumsan ut.
                Donec rhoncus tempus rutrum.
              </p>
              <Button variant='primary'>Mint a RIZK</Button>
            </Col>
          </Row>
        </Container>
      </Slide>

      {/* Section 4 */}
      <Slide className='forth__section' id='team'>
        <Container>
          <Row className='text-center'>
            <Col md={12} className='mb-5'>
              <h1>Line Up</h1>
            </Col>
            <Col md={3}>
              <Image src={line1} fluid className='mb-5' />
              <h3>Halo</h3>
            </Col>
            <Col md={3}>
              <Image src={line2} fluid className='mb-5' />
              <h3>MadMax</h3>
            </Col>
            <Col md={3}>
              <Image src={line3} fluid className='mb-5' />
              <h3>Basi</h3>
            </Col>
            <Col md={3}>
              <Image src={line4} fluid className='mb-5' />
              <h3>Nodo</h3>
            </Col>
            <Col md={3}>
              <Image src={line5} fluid className='mb-5' />
              <h3>Mimi</h3>
            </Col>
            <Col md={3}>
              <Image src={line6} fluid className='mb-5' />
              <h3>Sava</h3>
            </Col>
            <Col md={3}>
              <Image src={line7} fluid className='mb-5' />
              <h3>Peto</h3>
            </Col>
            <Col md={3}>
              <Image src={line8} fluid className='mb-5' />
              <h3>Qiya</h3>
            </Col>
          </Row>
        </Container>
      </Slide>

      {/* Section 5 */}
      <Slide className='fifth__section' id='roadmap'>
        <Container>
          <Row>
            <Col md={12}>
              <h2>The Roadmap</h2>
              {/* <Roadmap /> */}
              <div className='mt-5'>
                <p className='text'>PRESALE</p>
                <p className='text'>
                  The buyers of the first 500 RIZK will participate in
                  an AirDrop of 10 RIZK (so cap)
                </p>
                <ul>
                  <li>10% - Your RIZK writes The Alien Note.</li>
                  <li>20% - A random number of RIZK joins the Metaverse.</li>
                  <li>40% - A random number of RIZK joins the Metaverse.</li>
                  <li>Featuring Limited Edition tees, hoodies, sunglasses and more.</li>
                  <li>80% - The Mothership becomes interactive and The Alien Notes are revealed.</li>
                  <li>100% - The Mothership is fixed. Should use we leave Earth or not? You'll decide.</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </Slide>

      <Footer />
    </FullPage>
  )
}

export default App
