var totalPrice, j, totalQty = 0;
var displayButton = true;

$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const cartID = urlParams.get('cartID');
    getCartItems(cartID);
    
    updatecounter();
    $("#paymentMethod").on("change", function() {
        handlePaymentMethodChange();
    });
    $("#cashAmount").on("input", function() {
        updateChangeDisplay();
    });
});
$("#checkoutForm").submit(function(event) {
    validateForm(event);
});

  function getContainerNameFromURL() {
    var url = window.location.href;
    if (url.includes("cartInfo")) {
        return "itemsInCart";
    } else if (url.includes("printpage")) {
        return $("#itemsInOrder");
    } else {
        displayButton = false;
        return null;
    }
}

function findClosedCarts() {
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/findClosedCarts',
        method: 'GET'
    }).done(function(data) {
        for (let i = 0; i < data.result.length; i++) {
            const cartID = data.result[i].cartID;
            const cartBox = $('<div id="cart-box" style="border: 2px solid #000; padding: 10px; margin-bottom: 20px;">');
            const itemsContainerId = 'itemsContainer_' + i;
            const itemsContainer = $('<div id="' + itemsContainerId + '"></div>');
            cartBox.append(itemsContainer);
            const printButton = $('<a href="printpage.html?cartID=' + cartID + '" class="btn btn-primary bg-custom">Print Receipt</a>');
            cartBox.append(printButton);
            cartBox.append('<p>' + data.result[i].closedDateTime + '</p>');
            $("#orderHistory").append(cartBox);
            getCartItems(cartID, itemsContainer);
        }
    }).fail (function (error) {
        console.error("Error in findClosedCarts:", error);
    });
}
var productFigure, productImage, productCaption;
function printHTML(data, i, itemsContainer) {
    var productFigure = $('<figure id=' + data.cart[i].product_id + ' style="display: inline-block; margin-right: 20px;">');
    var productImage = $('<img style="display: block; margin-bottom: 10px; height: 200px;">');
    productImage.attr('src', data.cart[i].image);
    productFigure.attr('data-product-id', data.cart[i].product_id);
    var productCaption = $('<figcaption>');
    productCaption.append(data.cart[i].title);
    productCaption.append('<br>$' + data.cart[i].price);
    productCaption.append('<br>' + data.cart[i].category + ", " + data.cart[i].subcategory);
    productCaption.append('<br>' + "Amount in Cart: " + data.cart[i].qty);
    var targetElement = getContainerNameFromURL() || itemsContainer;
    targetElement.append(productFigure);
    if (targetElement.attr('id') !== 'itemsInOrder') {
        productFigure.append(productImage);
    } else {
        displayButton = false;
    }
    productFigure.append(productCaption);
    getItemQty(data.cart[i].cartID, data.cart[i].product_id, function(qty) {
        totalQtyOfCurrItem = qty;
        totalQty += parseInt(qty);      
    });
    if (displayButton) {
        productFigure.hover(
            function() {
                $(this).css('cursor', 'pointer');
            },
            function() {
                $(this).css('cursor', 'default');
            }
        );
        productFigure.click(function() {
            var selectedQty = prompt('Select the quantity:', 1);
            if (selectedQty !== null) {
                var productId = $(this).data('product-id');
                selectedQty = parseInt(selectedQty);
                if (!isNaN(selectedQty) && selectedQty <= totalQtyOfCurrItem && selectedQty > 0 && totalQty > 0) {
                    removeItemFromCart(data.cart[j].cartID, data.cart[j].product_id, selectedQty, data.cart[j].price);
                    var clickedItemIndex = productId;
                    totalQtyOfCurrItem -= selectedQty;
                    totalQty -= selectedQty;
                    if (totalQtyOfCurrItem > 0) {
                        productCaption.text(data.cart[i].title);    
                        productCaption.append('<br>$' + data.cart[i].price);
                        productCaption.append('<br>' + data.cart[i].category + ", " + data.cart[i].subcategory);
                        productCaption.append('<br>' + "Amount in Cart: " + totalQtyOfCurrItem);
                    }
                    else {
                        $("#" + clickedItemIndex).remove();
                    };
                } else {
                    alert('Invalid quantity. Please select a quantity between 1 and ' + totalQtyOfCurrItem + '. ' + selectedQty + " " + totalQtyOfCurrItem);
                }
            }
        });
    } else {

    }
}
function getCartItems(cartIDParam, itemsContainer) {
    var cartID = cartIDParam || localStorage.getItem('cartID');
    
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/getCartItems?cartID=' + cartID, 
        method: 'GET'
    }).done(function(data) {
        for (let i = 0; i < data.cart.length; ++i) {
            j = i;
            printHTML(data, i, itemsContainer);
        }
    }).fail (function (error) {
        targetElement.html('<p>Error: ' + error.message + '</p>');
    })
}
function getItemQty(cartID, product_id, callback) {
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/getItemQty?cartID=' + cartID + '&product_id=' + product_id, 
        method: 'GET'
    }).done(function(data) {
        var qty = data.result[0].qty;
        callback(qty);
    }).fail(function (error) {  
        console.error("Error in getItemQty:", error);
    })
}
function submitCheckout() {
    var name = $("#userName").val();
      var paymentMethod = $("#paymentMethod").val();
      var cashAmount = $("#cashAmount").val();
      var cardNumber = $("#cardNumber").val();
      var expiryDate = $("#expiryDate").val();
      var securityCode = $("#securityCode").val();
      var changeAmount = parseFloat($("#changeAmount").text());
      if (changeAmount < 0 && paymentMethod === 'cash') {
        alert("Change amount cannot be less than 0. Please review your payment.");
        return;
      }
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/makeSale?cartID=' + localStorage.getItem('cartID'),
        method: 'POST', 
        data: {
            name: name,
            paymentMethod: paymentMethod,
            cashAmount: cashAmount,
            cardNumber: cardNumber,
            expiryDate: expiryDate,
            securityCode: securityCode
        }
    }).done(function(data) {
        localStorage.clear();
        window.location.href='ecommerce.html';
        updatecounter();
        
    }).fail(function(error) {
        console.error("Error in makeSale:", error);
    });
    return false;
}
function displayReceipt(data) {
    var itemsContainer = $("#itemsContainer");
    for (var i = 0; i < data.cart.length; ++i) {
        var itemBox = $('<div class="item-box">');
        itemBox.append('<div>Name: ' + data.cart[i].title + '</div>');
        itemBox.append('<div>Category: ' + data.cart[i].category + ', ' + data.cart[i].subcategory + '</div>');
        itemBox.append('<div>Amount: ' + data.cart[i].qty + '</div>');
        itemBox.append('<div>Price: $' + data.cart[i].price + '</div>');
        itemsContainer.append(itemBox);
    }

    var paymentInfo = $("#paymentInfo");
    paymentInfo.append('<div>Total Items: ' + data.cart.length + '</div>');
    paymentInfo.append('<div>Total Price: $' + calculateTotalPrice(data.cart) + '</div>');
    paymentInfo.append('<div>Payment Method: ' + data.paymentMethod + '</div>');
    paymentInfo.append('<div>Cash Amount: $' + data.cashAmount + '</div>');
    paymentInfo.append('<div>Card Number: ' + data.cardNumber + '</div>');
    paymentInfo.append('<div>Expiry Date: ' + data.expiryDate + '</div>');
    paymentInfo.append('<div>Security Code: ' + data.securityCode + '</div>');
}
function calculateTotalPrice(cart) {
    var totalPrice = 0;
    for (var i = 0; i < cart.length; ++i) {
        totalPrice += cart[i].price * cart[i].qty;
    }
    return totalPrice.toFixed(2);
}

function handlePaymentMethodChange() {
    var selectedPaymentMethod = $("#paymentMethod").val();
    if (selectedPaymentMethod === 'cash') {
        $("#cashAmountInput").show().find('input').prop('required', true);
        $("#cardDetails").hide().find('input').prop('required', false);
        $("#cardNumber").hide().find('input').prop('required', false);
        $("#expiryDate").hide().find('input').prop('required', false);
        $("#securityCode").hide().find('input').prop('required', false);
        $("#cardDetails").prop('disabled', true);
        $("#cardNumber").prop('disabled', true);
        $("#expiryDate").prop('disabled', true);
        $("#securityCode").prop('disabled', true);
        $("#changeDisplay").show();
        updateChangeDisplay();
      } else if (selectedPaymentMethod === 'card') {
        $("#cashAmountInput").hide().find('input').prop('required', false);
        $("#cardDetails").show().find('input').prop('required', true);
        $("#cardNumber").show().find('input').prop('required', true);
        $("#expiryDate").show().find('input').prop('required', true);
        $("#securityCode").show().find('input').prop('required', true);
        $("#cardDetails").prop('disabled', false);
        $("#cardNumber").prop('disabled', false);   
        $("#expiryDate").prop('disabled', false);
        $("#securityCode").prop('disabled', false);
        $("#changeDisplay").hide();
      }
}
function updateChangeDisplay() {
    var cashAmount = parseFloat($("#cashAmount").val()) || 0;
    var change = cashAmount - parseFloat(totalPrice) || 0;
    $("#changeAmount").text(change.toFixed(2));
}

function removeItemFromCart(cartID, product_id, qty, price) {
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/removeItemFromCart?cartID=' + cartID + '&product_id=' + product_id + '&qty=' + qty + '&price=' + price, 
        method: 'GET'
    }).done(function(data) {
        itemCount -= qty;
        totalPrice -= price * qty;
        localStorage.setItem('itemCount', itemCount);
        localStorage.setItem('totalPrice', totalPrice);
        updatecounter();
        
    }).fail (function (error) {
        $('#productList').html('<p>Error: ' + error.message + '</p>');
    })
}
function updatecounter() {
    itemCount = localStorage.getItem('itemCount');
    totalPrice = localStorage.getItem('totalPrice');
    $('#itemCountBadge').text(itemCount);
    $('#totalPrice').text(totalPrice);
}