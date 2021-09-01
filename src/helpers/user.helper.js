async function checkForDuplicateAddress(userAddresses, newAddress) {
    let arrayLength = userAddresses.length;
    for (let j = 0; j < arrayLength; j++) {
        if (userAddresses[j].address === newAddress.address)
            return true;
    }
    return false;
}

async function getProductDetails(productsRawData) {
    try {
        let arrayLength = productsRawData.length;
        let products = [];
        for (let j = 0; j < arrayLength; j++) {
            products.push({
                product: productsRawData[j].productName,
                seller: productsRawData[j].productSeller,
                color: productsRawData[j].productColor,
                quantity: productsRawData[j].orderQuantity,
                image: productsRawData[j].productImage,
                price: productsRawData[j].productPrice
            })
        }
        return products;
    } catch (error) {
        return error;
    }

}

module.exports = { checkForDuplicateAddress, getProductDetails };