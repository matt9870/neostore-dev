exports.getHtml = async (orderData, orderDate) => {
  let productsTable = ``;
  let products = orderData.productDetails, noOfProducts = orderData.productDetails.length;
  for (let j = 0; j < noOfProducts; j++) {
    productsTable += `<tr>
    <td>${products[j].productName}</td>
    <td>${products[j].productSeller}</td>
    <td>${products[j].productColor}</td>
    <td>${products[j].orderQuantity}</td>
    <td>${products[j].productPrice}</td>
    <td>${products[j].total}</td>
  </tr>`
  }
  let html = `
    <!DOCTYPE html>
<html>
<head>
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap" rel="stylesheet" />
</head>
<style>
  .lr_container {
    display: flex;
    align-items: flex-start;
  }
  .left {
    width: 50%;
  }
  
  .right {
    width: 50%;
    display: flex;
    justify-content: flex-end;
  }
  
  .horizontalLine {
    width: 100%;
    height: 2px;
    background: #000;
    margin-bottom: 10px;
    margin-top: 8px;
  }
  table {
    width: 100%;
  }
  
  td {
    border: 1px solid #000;
    text-align: center;
    padding: 8px;
  }
  .container {
    padding: 0 14px;
  }
  
  table {
    border-collapse: collapse;
    border-radius: 8px;
  }
  
  td {
    border: 1px solid #000;
  }
  .container {
    padding: 0 14px;
  }
  
  thead td {
    text-align: center;
    font-weight: 600;
  }  
</style>
<body id='body'>
  <div class="mainContainer">
    <div class="container">
      <div class="lr_container">
        <div class="left">
          <h3 class="invoice">Invoice</h3>
        </div>
        <div class="right">
          <div class="companyDetails">
            <br />
            Neostore <br />
            Madison Avenue, 6th Street<br />
            New York City, New York, USA <br />
            Zip - 10002
          </div>
        </div>
      </div>
    </div>
    <!-- Horizontal Line -->
    <div class="horizontalLine"></div>
    <!-- Horizontal Line -->
    <div class="container">
      <div class="lr_container">
        <div class="left">
          <div><b>Buyer</b></div>
          <div class="buyer-details">
            ${orderData.userName} <br />
            ${orderData.email} <br />
            ${orderData.address.address} <br />
            ${orderData.city}, ${orderData.state} <br />
            ${orderData.country}, Zip - ${orderData.pincode} <br />
          </div>
        </div>
        <div class="right">
          <div class="order-details">
            <b>Order ID - ${orderData.orderId}</b><br />
            Date - ${orderDate}<br />
          </div>
        </div>
      </div>
      <!-- Horizontal Line -->
      <div class="horizontalLine"></div>
      <!-- Horizontal Line -->

    </div>

    <div class="container" style="margin-top: 16px; margin-bottom: 37px">
      <div style="font-size: 18px; font-weight: 600">Products</div>

    </div>
    <div class="container">
      <div class="product-details">
        <table class="product-details-table">
          <tr id="products-table-heading">
            <th>Product</th>
            <th>Seller</th>
            <th>Color</th>
            <th>Qauntity</th>
            <th>Price in USD</th>
            <th>Total in USD</th>
          </tr>
          ${productsTable}
        </table>
      </div>
      <br />
      <!-- Horizontal Line -->
      <div class="horizontalLine"></div>
      <!-- Horizontal Line -->
    </div>

    <div class="container">
      <div class="lr_container">
        <div class="left">
        </div>
        <div class="right">
          <div class="order-details">
            <h4>Sub-Total:  ${orderData.subTotalPrice}</h4>
            <h5>Adding Tax of 5% to Sub-Total</h5>
            <h3>Total:  ${orderData.totalPrice} USD</h3><br />
          </div>
        </div>
      </div>
    </div>
</body>

</html>`
  return html;
}