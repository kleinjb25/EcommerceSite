var totalPrice, j, totalQty = 0;

$(document).ready(function() {
    getCartItems();
    updatecounter();
    $("#paymentMethod").on("change", function() {
        handlePaymentMethodChange();
    });
    $("#cashAmount").on("input", function() {
        updateChangeDisplay();
    });
});
function getCartItems() {
    cartID = localStorage.getItem('cartID');
    $.ajax({
        url: 'http://172.17.14.238/cse383_final/final.php/getCartItems?cartID=' + cartID, 
        method: 'GET'
    }).done(function(data) {
        $("#productList").empty();
        for (let i = 0; i < data.cart.length; ++i) {
            j = i;
            var productFigure = $('<figure id= ' + data.cart[i].product_id + ' style="display: inline-block; margin-right: 20px;">');
            var productImage = $('<img style="display: block; margin-bottom: 10px; height: 200px;">');
            productImage.attr('src', data.cart[i].image);
            productFigure.attr('data-product-id', data.cart[i].product_id);
            var productCaption = $('<figcaption>');
            productCaption.append(data.cart[i].title);
            productCaption.append('<br>$' + data.cart[i].price);
            productCaption.append('<br>' + data.cart[i].category + ", " + data.cart[i].subcategory);
            productCaption.append('<br>' + "Amount in Cart: " + data.cart[i].qty);
            var totalQtyOfCurrItem = data.cart[i].qty;
            totalQty += data.cart[i].qty;
            productFigure.append(productImage);
            productFigure.append(productCaption);
            productFigure.click(function() {
                var selectedQty = prompt('Select the quantity:', 1);
                if (selectedQty !== null) {
                    var productId = $(this).data('product-id');
                    selectedQty = parseInt(selectedQty);
                    if (!isNaN(selectedQty) && selectedQty <= totalQtyOfCurrItem && selectedQty > 0) {
                        console.log(j + " " + data.cart[j].product_id);
                        removeItemFromCart(cartID, data.cart[j].product_id, selectedQty, data.cart[j].price);
                        var clickedItemIndex = productId;
                        totalQtyOfCurrItem -= selectedQty;
                        totalQty -= selectedQty;
                        if (totalQtyOfCurrItem > 0) {
                            console.log(" tq > 0" + i);
                            productCaption.text(data.cart[i].title);
                            productCaption.text('<br>$' + data.cart[i].price);
                            productCaption.text('<br>' + data.cart[i].category + ", " + data.cart[i].subcategory);
                            productCaption.text('<br>' + "Amount in Cart: " + totalQtyOfCurrItem);
                        }
                        else {
                            console.log(" tq = 0" + i);
                            $("#" + clickedItemIndex).remove();
                        };
                    } else {
                        alert('Invalid quantity. Please select a quantity between 1 and ' + totalQtyOfCurrItem + '. ' + selectedQty + " " + totalQtyOfCurrItem);
                    }
                }
            });
            productFigure.hover(
                function() {
                    $(this).css('cursor', 'pointer');
                },
                function() {
                    $(this).css('cursor', 'default');
                }
            );
            $("#itemsInCart").append(productFigure);
        }
    }).fail (function (error) {
        $('#itemsInCart').html('<p>Error: ' + error.message + '</p>');
    })
}

function submitCheckout() {
    var name = $("#userName").val();
    var paymentMethod = $("#paymentMethod").val();
    var cashAmount = $("#cashAmount").val();
    var cardNumber = $("#cardNumber").val();
    var expiryDate = $("#expiryDate").val();
    var securityCode = $("#securityCode").val();
    $.ajax({
        url: 'http://172.17.14.238/cse383_final/final.php/makeSale?cartID=' + localStorage.getItem('cartID'),
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
}
function handlePaymentMethodChange() {
    var selectedPaymentMethod = $("#paymentMethod").val();
    if (selectedPaymentMethod === 'cash') {
        $("#cashAmountInput").show();
        $("#cardDetails").hide();
        $("#changeDisplay").show();
        updateChangeDisplay();
    } else if (selectedPaymentMethod === 'card') {
        $("#cashAmountInput").hide();
        $("#cardDetails").show();
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
        url: 'http://172.17.14.238/cse383_final/final.php/removeItemFromCart?cartID=' + cartID + '&product_id=' + product_id + '&qty=' + qty + '&price=' + price, 
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