import Image from "next/image"
import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"
import NFTMarketplaceABI from "../constants/NFTMarketplace.json"
import basicNFTABI from "../constants/basicNFT.json"


function truncateStr(fullStr, strLen)
{
  const realLen = strLen - 3
  const frontSlice = Math.ceil(realLen / 2) // rounds up
  const backSlice = Math.floor(realLen / 2) // rounds down
  // ^ front and backslice since its 0.5 they'll add up to be the same number again
  const frontChars = fullStr.slice(0, frontSlice)
  const backChars = fullStr.slice(fullStr.length - backSlice, fullStr.length)
  const charsToDisplay = frontChars + "..." + backChars

  return charsToDisplay
}

export default function NFTBox ({ price, nftAddress, tokenId, marketplaceAddress, seller })
{
  const dispatch = useNotification()
  const { isWeb3Enabled, account } = useMoralis()
  const [imageURI, setImageURI] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokenDescription, setTokenDescription] = useState("")
  const [showModal, setShowModal] = useState(false)


  const { runContractFunction: getTokenURI } = useWeb3Contract(
    {
      abi: basicNFTABI,
      contractAddress: nftAddress,
      functionName: "tokenURI",
      params: {
        tokenId: tokenId
      }
    }
  )

  const { runContractFunction: buyItem } = useWeb3Contract(
    {
      abi: NFTMarketplaceABI,
      contractAddress: marketplaceAddress,
      functionName: "buyItem",
      msgValue: price,
      params: {
        nftAddress_: nftAddress,
        tokenId_: tokenId
      }
    }
  )

  async function updateUI()
  { // get the token URI and then the image URI
    const tokenURI = await getTokenURI()
    // console.log(tokenURI)
    if(tokenURI)
    { // our journey to decentralization is still far so for now v
      // we'll use an https protocol rather than ipfs as all browsers have not yet adopted ipfs
      // this will be done using an IPFS gateway
      const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/") // switching to https
      // ^ so it becomes https://ipfs.io/ipfs/bafybeig37io...gkaheg4/?filename=0-PUG.json
      const tokenURIResponse = await (await fetch(requestURL)).json() 
      // ^ fetch api fetching api data and converting to json as usual
      // v using https protocol for image URI
      const imageURI = tokenURIResponse.image
      const imageToURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
      setImageURI(imageToURL)
      setTokenName(tokenURIResponse.name)
      setTokenDescription(tokenURIResponse.description)
    }
  }

  useEffect(()=>
  {
    if(isWeb3Enabled){updateUI()}
  }, [isWeb3Enabled])

  const isOwnedByUser = (seller === account) || (seller === undefined) // if any of these are true
  const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 12)

  const handleCardClick = () => {isOwnedByUser ? setShowModal(true) : 
    buyItem({ onError: (e)=>console.log(e), onSuccess: handleBuyItemSuccess })}    
  const handleModalClose = ()=>{setShowModal(false)}
  const handleBuyItemSuccess = () => 
  {
    dispatch({
      type: "success",
      message: "Item bought",
      title: "Item bought",
      position: "topR"
    })
  }

  
  return (
    <div>
      {
        imageURI ? 
          <div className="m-4">
            <UpdateListingModal 
              isVisible={showModal}
              tokenId={tokenId}
              nftAddress={nftAddress}
              marketplaceAddress={marketplaceAddress}
              onClose={handleModalClose}
            />

            <Card title={tokenName} description={tokenDescription} onClick={handleCardClick}>
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">Owned by {formattedSellerAddress}</div>
                  <Image
                    loader={()=>imageURI}
                    src={imageURI}
                    height="200"
                    width="200"
                    alt="image"
                  />
                  <div className="font-bold">
                    {ethers.utils.formatUnits(price, "ether")}ETH
                  </div>
                </div>
              </div>
            </Card>
          </div> : 
          (<div>Loading...</div>)
      }
    </div>
  )
}