import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import { Form, useNotification, Button } from "web3uikit"
import basicNFTABI from "../constants/basicNFT.json"
import NFTMarketplaceABI from "../constants/NFTMarketplace.json"
import networkMapping from "../constants/networkmapping.json"


export default function SellNFT() {
  const dispatch = useNotification()

  const { chainId, account, isWeb3Enabled } = useMoralis() // will return 0x231..
  const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainIdString]["NFTMarketplace"][0]
  const { runContractFunction } = useWeb3Contract()
  const [proceeds, setProceeds] = useState("0")

  async function approveAndList(data)
  {
    console.log("Approving..")
    const NFTAddress = data.data[0].inputResult
    const tokenId = data.data[1].inputResult
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

    const approveOptions = {
      abi: basicNFTABI,
      contractAddress: NFTAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId
      }
    }

    await runContractFunction({
      params: approveOptions,
      onSuccess: async (tx)=>{await tx.wait(1); handleApproveSuccess(NFTAddress, tokenId, price)},
      onError: (e)=>{console.log(e)}
    }) 
  }

  async function handleApproveSuccess(NFTAddress, tokenId, price)
  {
    console.log("Now Listing...")
    console.log(`Marketplace address: ${marketplaceAddress}`)
    const listOptions = 
    {
      abi: NFTMarketplaceABI,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress_: NFTAddress,
        tokenId_: tokenId,
        price_: price 
      }
    }

    await runContractFunction({
      params: listOptions,
      onSuccess: handleListSuccess,
      onError: (e)=>{console.log(e)}
    })
  }

  async function handleListSuccess(tx)
  {
    await tx.wait(1)
    dispatch({
      type: "success",
      message: "NFT listed successfully",
      position: "topR"
    })
  }

  async function handleWithdrawSuccess(tx)
  {
    await tx.wait(1)
    dispatch({
      type:"success",
      message: "Withdrawing Proceeds",
      position: "topR"
    })
  }

  async function setupUI()
  {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: NFTMarketplaceABI,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds", // returns proceeds in big number
        params: { seller_: account }
      },
      onError: (e)=>{console.log(e)}
    })
    if(returnedProceeds){setProceeds(returnedProceeds.toString())}
  }

  useEffect(()=>{
    if(isWeb3Enabled){setupUI()}
  }, [proceeds, account, isWeb3Enabled, chainId])
  // ^ if any of these change rerun useEffect i.e. rerun setupUI()

  return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        data={[
          { 
            name: "NFT Address", 
            type: "text",
            inputWidth: "50%",
            value: "",
            key: "NFTAddress"
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId"
          },
          {
            name: "Price (in ETH)",
            type: "number",
            value: "",
            key: "price"
          }
        ]}
        title="Sell your NFT"
        id="MainForm"
      /> 

      <h1>Withdraw proceeds: {ethers.utils.formatUnits(proceeds, "ether")}ETH</h1>

      {proceeds != "0" ? (
        <Button 
          onClick={()=>
          {
            runContractFunction({
              params: {
                abi: NFTMarketplaceABI,
                contractAddress: marketplaceAddress,
                functionName: "withdrawProceeds",
                params: {}
              },
              onError: (e)=>console.log(e),
              onSuccess: handleWithdrawSuccess
            })
          }}
          text="Withdraw"
          type="button"
        />
      ) : (<p>No proceeds detected</p>)}
    </div>
  )
}
