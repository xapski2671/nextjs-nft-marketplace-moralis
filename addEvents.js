// a moralis script to watch for contract events
const Moralis = require("moralis/node")
require("dotenv").config()
const contractAddresses = require("./constants/networkmapping.json")


let chainId = process.env.chainId || "31337"
let moralisChainId = (chainId == "31337") ? "1337" : chainId
// ^ if chain id is 31337 then moralis chain id should be 1337
const contractAddress = contractAddresses[chainId]["NFTMarketplace"][0]
const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL
const appId = process.env.NEXT_PUBLIC_MORALIS_APP_ID
const masterKey = process.env.moralisMasterKey

async function main()
{
  await Moralis.start({ serverUrl, appId, masterKey })
  console.log(`Working with contract address: ${contractAddress}`)
  // creating the options object for the call
  let itemListedOptions = 
  { // Moralis sees all local chains as 1337
    chainId: moralisChainId,
    // sync historical allows moralis to check previous blocks for events rather than just current ones
    sync_historical: true,
    topic: "ItemListed(address,address,uint256,uint256)", // event details
    address: contractAddress,
    abi: // the part of the abi responsible for that event alone
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller_",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftAddress_",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId_",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price_",
          "type": "uint256"
        }
      ],
      "name": "ItemListed",
      "type": "event"
    },
    tableName: "ItemListed"
  }
  
  let itemBoughtOptions =
  {
    chainId: moralisChainId,
    sync_historical: true,
    topic: "ItemBought(address,address,uint256,uint256)", // event details
    address: contractAddress,
    abi:    
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer_",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftAddress_",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId_",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price_",
          "type": "uint256"
        }
      ],
      "name": "ItemBought",
      "type": "event"
    },
    tableName: "ItemBought"
  }

  let itemRemovedOptions =
  {
    chainId: moralisChainId,
    sync_historical: true,
    topic: "ItemRemoved(address,address,uint256)", // event details
    address: contractAddress,
    abi:   
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller_",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nftAddress_",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId_",
          "type": "uint256"
        }
      ],
      "name": "ItemRemoved",
      "type": "event"
    },
    tableName: "ItemRemoved"
  }

  // (api call) to send to server we say
  const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, { useMasterKey: true })
  const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, { useMasterKey: true })
  const removedResponse = await Moralis.Cloud.run("watchContractEvent", itemRemovedOptions, { useMasterKey: true })

  if(listedResponse.success && boughtResponse.success && removedResponse.success)
  {
    console.log("Success!!")
  }
  else{console.log("Something went wrong...")}
}

main()
  .then(()=>{process.exit(0)})
  .catch((e)=>
  {
    console.log(e)
    process.exit(1)
  })

