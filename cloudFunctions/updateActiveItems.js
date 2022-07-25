// MORALIS CLOUD DATABASE CRUD OPERATIONS
// create a new table called "active item"
// add items to it when they're listed
// removed items from it when they are bought or removed
// our front end will read from this table

// v aftersave means anything something is saved to a specified table, it will trigger something
Moralis.Cloud.afterSave("ItemListed", async (request) => // we don't need to import moralis since it will be uploaded anyways
{ // events are usually triggered twice, we will only trigger after it has been confirmed
  const confirmed = request.object.get("confirmed")
  const logger = Moralis.Cloud.getLogger()
  logger.info("Looking for confirmed Tx")
  if(confirmed)
  {
    logger.info("found item!!")
    // DATABASE WORKS
    const ActiveItem = Moralis.Object.extend("ActiveItem") // datatbase operation (CREATE TABLE)  // Active Item Collection

    // if document already exists
    // U operation == D operation + C operation
    const query = new Moralis.Query(ActiveItem) 
    query.equalTo("marketplaceAddress", request.object.get("address"))
    query.equalTo("nftAddress", request.object.get("nftAddress_"))
    query.equalTo("tokenId", request.object.get("tokenId_")) // finding matching parameters
    query.equalTo("seller", request.object.get("seller_")) 
    const alreadyListedItem = await query.first()
    if(alreadyListedItem)
    {
      logger.info(`Updating already listed item ${request.object.get("objectId")}`)
      await alreadyListedItem.destroy()
    }

    // C operation create document
    const activeItem = new ActiveItem() // activeItem document
    activeItem.set("marketplaceAddress", request.object.get("address"))
    // ^ getting marketplace address from the txReceipt and setting it to its own column
    // collecting args from our ItemListed event and setting then to columns
    activeItem.set("nftAddress", request.object.get("nftAddress_"))
    activeItem.set("price", request.object.get("price_"))
    activeItem.set("tokenId", request.object.get("tokenId_"))
    activeItem.set("seller", request.object.get("seller_"))
    logger.info(`Adding Address: ${request.object.get("address")}`)
    logger.info("saving...")
    await activeItem.save()
  }
}) 

// v script for a removed item
Moralis.Cloud.afterSave("ItemRemoved", async (request)=>
{
  const confirmed = request.object.get("confirmed")
  const logger = Moralis.Cloud.getLogger()
  logger.info(`Marketplace | Object: ${request.object}`)
  if(confirmed)
  {
    logger.info("Item Removal?")
    // DATABASE WORKS
    const ActiveItem = Moralis.Object.extend("ActiveItem") // using active item table
    const query = new Moralis.Query(ActiveItem)
    query.equalTo("marketplaceAddress", request.object.get("address"))
    query.equalTo("nftAddress", request.object.get("nftAddress_"))
    query.equalTo("tokenId", request.object.get("tokenId_")) // finding matching parameters
    logger.info(`Marketplace Query: ${query}`)
    const removedItem = await query.first() // first document that matches parameters
    logger.info(`Removed Item: ${removedItem}`)
    if(removedItem)
    {
      logger.info(`Deleting ${request.object.get("tokenId_")} at nft address ${request.object.get("nftAddress_")}`)
      await removedItem.destroy() // D operation (CRUD)
    }
    else{logger.info("no item was found")}
  }
})

// v script for a bought item
Moralis.Cloud.afterSave("ItemBought", async (request)=>
{
  const confirmed = request.object.get("confirmed")
  const logger = Moralis.Cloud.getLogger()
  if(confirmed)
  {
    logger.info("item bought?")
    // DATABASE WORKS
    const ActiveItem = Moralis.Object.extend("ActiveItem") // using activeitem table
    const query = new Moralis.Query(ActiveItem)
    query.equalTo("marketplaceAddress", request.object.get("address"))
    query.equalTo("nftAddress", request.object.get("nftAddress_"))
    query.equalTo("tokenId", request.object.get("tokenId_")) // finding matching parameters
    logger.info(`Marketplace Query: ${query}`)
    const boughtItem = await query.first()
    logger.info(`Bought item: ${boughtItem}`)
    if(boughtItem)
    {
      logger.info(`${request.object.get("tokenId_")} at nft address ${request.object.get("nftAddress_")} 
      sold to ${request.object.get("buyer_")}`)
      logger.info("Deleting NFT...")
      await boughtItem.destroy() // D operation (CRUD) 
    }
    else{logger.info("no item was found")}
  }
})