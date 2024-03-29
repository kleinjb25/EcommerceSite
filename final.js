var cartID;
var itemCount;
var totalPrice;
$(document).ready(function() {
    populateSubcategories();
    updatecounter();
});
function filterAndSortProducts() {
    var categoryFilter = $('#subcategory').val();
    var sortOption = $('#sortOption').val();
    var priceFilter = $('#priceRange').val();
    if (priceFilter === "$0-$5")
        getProductJS('%', categoryFilter, 0, sortOption, 0, 5);
    else if (priceFilter === "$5-10")
        getProductJS('%', categoryFilter, 0, sortOption, 5, 10);
    else if (priceFilter === "$10+")
        getProductJS('%', categoryFilter, 0, sortOption, 10, 99999999);
    else
        getProductJS('%', categoryFilter, 0, sortOption, 0, 99999999)
}
function getProductJS(cat, sub, id, sortOption, minPrice, maxPrice) {
    cartID = localStorage.getItem('cartID');
    if (cartID === null) {
        createCartJS();
    }
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/getProduct?category=' + cat + '&subcategory=' + sub + '&id=' + id + '&sortOption=' + sortOption + '&minPrice=' + minPrice + '&maxPrice=' + maxPrice, 
        method: 'GET'
    }).done(function(data) {
        $("#productList").empty();
        for (let i = 0; i < data.result.length; i++) {
            var productFigure = $('<figure style="display: inline-block; margin-right: 20px;">');
            var productImage = $('<img style="display: block; height: 200px;">');
            productImage.attr('src', data.result[i].image);
            var productCaption = $('<figcaption>');
            productCaption.append(data.result[i].title);
            productCaption.append('<br>$' + data.result[i].price);
            productCaption.append('<br>' + data.result[i].category + ", " + data.result[i].subcategory);
            productFigure.append(productImage);
            productFigure.append(productCaption);
            productFigure.click(function() {
                var qtyOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                var selectedQty = prompt('Select the quantity:', 1);
                if (selectedQty !== null) {
                    selectedQty = parseInt(selectedQty);
                    if (!isNaN(selectedQty) && qtyOptions.includes(selectedQty)) {
                        addItemToCart(cartID, data.result[i].product_id, selectedQty, data.result[i].price);
                    } else {
                        alert('Invalid quantity. Please select a quantity between 1 and 10.');
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
            $("#productList").append(productFigure);
        }
        
    }).fail (function (error) {
        $('#productList').html('<p>Error: ' + error.message + '</p>');
    })
}

function createCartJS() {
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/createCart', 
        method: 'GET'
    }).done(function(data) {
        cartID = data.result[0].cartID;
        localStorage.setItem('cartID', cartID);
    }).fail(function(error) {
        console.error("Error in createCartJS:", error);
    });
}

function addItemToCart(cartID, product_id, qty, price) {
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/addItemToCart?cartID=' + cartID + '&product_id=' + product_id + '&qty=' + qty, 
        method: 'GET'
    }).done(function(data) {
        if (itemCount === undefined || totalPrice === undefined || itemCount == 0 || totalPrice == 0) {
            itemCount = qty;
            totalPrice = price * qty;  
        } else {
            itemCount = (parseInt(itemCount, 10) + parseInt(qty, 10)).toString();
            totalPrice = (parseFloat(totalPrice, 10) + parseFloat(price * qty, 10)).toString();
        }
        localStorage.setItem('itemCount', itemCount);
        localStorage.setItem('totalPrice', totalPrice);
        updatecounter();
    }).fail (function (error) {
        $('#productList').html('<p>Error: ' + error.message + '</p>');
    })
}

function updatecounter() {
    if (localStorage.getItem('itemCount') === null && localStorage.getItem('totalPrice') === null) {
        itemCount = '0';
        totalPrice = '0';
        localStorage.setItem('itemCount', itemCount);
        localStorage.setItem('totalPrice', totalPrice);
    } else {
        itemCount = localStorage.getItem('itemCount');
        totalPrice = localStorage.getItem('totalPrice');
    }
    $('#itemCountBadge').text(itemCount);
    $('#totalPrice').text(parseFloat(totalPrice).toFixed(2));
}

function populateSubcategories() {
    $.ajax({
        url: 'http://localhost:8080/cse383_final/final.php/getSubcategories',
        method: 'GET'
    }).done(function(data) {
        var subcategorySelect = $('#subcategory');
        subcategorySelect.empty();
        subcategorySelect.append('<option value="%">All Subcategories</option>');
        for (var i = 0; i < data.result.length; i++) {
            subcategorySelect.append('<option value="' + data.result[i].subcategory + '">' + data.result[i].subcategory + '</option>');
        }
        filterAndSortProducts();
    }).fail (function (error) {
        $('#itemsInCart').html('<p>Error: ' + error.message + '</p>');
    });
}

