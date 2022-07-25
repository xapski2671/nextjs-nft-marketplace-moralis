import { useState } from "react"
import { Modal, Input, useNotification } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import NFTMarketplaceABI from "../constants/NFTMarketplace.json"

export default function UpdateListingModal({ marketplaceAddress, nftAddress, tokenId, isVisible, onClose })
{
  const dispatch = useNotification()
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("")
  const { runContractFunction: updateListing } = useWeb3Contract( // a nft marketplace contract function
    {
      abi: NFTMarketplaceABI,
      contractAddress: marketplaceAddress,
      functionName: "updateListing",
      params: {
        nftAddress_: nftAddress,
        tokenId_: tokenId,
        newPrice_: ethers.utils.parseEther(priceToUpdateListingWith || "0")
      }
    }
  )

  async function handleUpdateListingSuccess(tx)
  {
    await tx.wait(1)
    dispatch(
      {
        type: "success",
        message: "listing updated",
        title: "listing updated, pls refresh",
        position: "topR"
      }
    )
    onClose && onClose()
    setPriceToUpdateListingWith("0")
  }

  
  return (
    <Modal 
      isVisible={isVisible} onCancel={onClose} 
      onCloseButtonPressed={onClose}
      onOk={()=>{updateListing(
        { 
          onError: (error)=>console.log(error),
          // ^ because contract function errors dont log automatically
          onSuccess: handleUpdateListingSuccess
        })}
      }  
    >
      <Input 
        label="Update Listing Price in L1 Currency (ETH)"
        name="New listing price"
        type="number"
        onChange={(event)=>{setPriceToUpdateListingWith(event.target.value)}}
      />
    </Modal>
  )
}