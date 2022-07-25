import Image from "next/image"
import { useMoralisQuery, useMoralis } from "react-moralis"
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"

export default function Home() 
{
  const { isWeb3Enabled } = useMoralis()
  const { data: listedNFTs, isFetching: fetchingListedNFTs } = useMoralisQuery(
    // useMoralisQuery collects the table name and the query function
    "ActiveItem",
    query=>query.descending("tokenId").limit(10) // take the first 10 rows in descending order of their tokenid
  )
  // console.log(listedNFTs)

  return (
    <div className="container mx-auto">
      <h1 className="p-4 font-bold text-2xl">Recent Listings</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? 
          fetchingListedNFTs ? (<div>Loading...</div>) : listedNFTs.map((NFT, index)=>
          {
            {/* v (NFT.attributes) is the object that contains the details we need */}
            const { price, nftAddress, tokenId, marketplaceAddress, seller } = NFT.attributes

            return(
              <div key={index}>
                {/* Price: {price}. NFT Address: {nftAddress}. Token Id: {tokenId}. Seller: {seller} */}
                <NFTBox
                  key={index}
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                />
              </div>
            )
          }) : (<div>Web3 currently not enabled. Connect your wallet!!</div>)}
      </div>
    </div>
  )
}
