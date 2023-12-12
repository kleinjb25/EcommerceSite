<?php 
class final_rest
{

/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apISuccess {Integer} status
 * @apISuccess {string} message
 *
 * @apISuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */

	public static function removeItemFromCart($cartID, $product_id, $qty) {
		try {
			$found=GET_SQL("SELECT cart.cartID FROM cart JOIN cartItem USING (cartID)
			WHERE cart.cartID=? AND product_id = ? AND cart.closedDateTime IS NULL",
			$cartID,$product_id);
			If (count($found) > 0) {
				$existingQty = $found[0]['qty'];

				if ($qty >= $existingQty) {
					EXEC_SQL("DELETE FROM cartItem WHERE cartID = ? AND product_id = ?", $cartID, $product_id);
				} else {
					EXEC_SQL("UPDATE cartItem SET qty = ? WHERE cartID = ? AND product_id = ?", $existingQty - $qty, $cartID, $product_id);
				}
				$retdata["found"]=0;
				$retData["message"]="found";
			}
			Else {
				$retdata["found"]=1;
				$retData["message"] = "Not found";
			}

		} catch (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}
		return json_encode ($retData);
	}
	public static function getProduct($category, $subcategory, $id, $sortOption, $minPrice, $maxPrice) {
	try {
		$orderBy = '';

		switch ($sortOption) {
			case 'lowtohigh':
				$orderBy = 'ORDER BY price ASC';
				break;
			case 'hightolow':
				$orderBy = 'ORDER BY price DESC';
				break;
			case 'alphabetical':
				$orderBy = 'ORDER BY title ASC';
				break;
			default:
				$orderBy = 'ORDER BY description ASC';
				break;
		}
		$retData["result"] = GET_SQL("SELECT * FROM product WHERE category LIKE ? AND subcategory LIKE ? AND (product_id = ? OR ? = '0') AND (price BETWEEN ? AND ?) $orderBy", $category, $subcategory, $id, $id, $minPrice, $maxPrice);
		$retData["status"] = 0;
		$retData["message"] = "sql get query success";
	} catch (Exception $e) {
		$retData["status"] = 1;
		$retData["message"] = $e->getMessage();
	}

	return json_encode($retData);
	}


	public static function createCart() {
		try {
			EXEC_SQL("INSERT INTO cart (closedDateTime) VALUES (null)");
			$retData["result"]=GET_SQL("SELECT last_insert_rowid() AS cartID");
			$retData["status"]=0;
			$retData["message"]="sql get query success";
		} catch (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}
		return json_encode ($retData);
	}

	public static function addItemToCart($cartID, $product_id, $Qty) {
		try {
			$CART=GET_SQL("SELECT cart.cartID FROM cart
			WHERE cart.cartID=? AND cart.closedDateTime IS NULL", $cartID);
			If (count($CART) > 0) {
				$ITEM=GET_SQL("SELECT * FROM cartItem
				WHERE cartID=? AND product_id = ?", $cartID,$product_id);
				if (count($ITEM) > 0) {
					EXEC_SQL("UPDATE cartItem SET qty=qty+? WHERE cartID=? AND
					product_id = ?",$Qty,$cartID,$product_id);
					$retdata["found"]=0;
					$retData["message"]="existing product $product_id set to $Qty";
				}
				Else {
					EXEC_SQL("INSERT INTO cartItem (Qty,cartID,product_id) VALUES
					(?,?,?)",$Qty,$cartID,$product_id);
					$retdata["found"]=0;
					$retData["message"]="product $product_id added to cart = $Qty";
				}
			}
			Else {
				$retdata["found"]=1;
				$retData["message"] = "Cart not found or not available";
			}
		} catch (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}
		return json_encode ($retData);
	}

	public static function getCartItems($cartID) {
		try {
			$retData["cart"]=GET_SQL("SELECT * FROM cart JOIN cartitem USING (cartID)
			JOIN product USING (product_id)
			WHERE cart.cartID=? AND cart.closedDateTime IS NULL ORDER BY
			Category,Subcategory,Title", $cartID);
			$retdata["found"]=0;
			$retData["message"] = "Returned all items in cart $CartId";

		} catch (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}
		return json_encode ($retData);
	}
	public static function makeSale($cartID) {
		try {
			$CART=GET_SQL("SELECT cart.cartID FROM cart
			WHERE cart.cartID=? AND cart.closedDateTime IS NULL", $cartID);
			If (count($CART) > 0) {
				EXEC_SQL("UPDATE  cart SET closedDateTime=CURRENT_TIMESTAMP WHERE
				cartID=?",$cartID,);
				$retdata["found"]=0;
				$retData["message"]="closed cart $cartID";
			}
			Else {
				$retdata["found"]=1;
				$retData["message"] = "Cart not found or not available";
			}
		} catch (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}
		return json_encode ($retData);
	}

	public static function findClosedCarts() {
		try {
			$retData["result"]=GET_SQL("SELECT * FROM cart WHERE
			closedDateTime IS NOT NULL ORDER BY closedDateTime DESC");
		} catch (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}
		return json_encode ($retData);
	}
	public static function getSubcategories() {
	try {
		$retData["result"] = GET_SQL("SELECT DISTINCT subcategory FROM product");
		$retData["status"] = 0;
		$retData["message"] = "sql get query success";
	} catch (Exception $e) {
		$retData["status"] = 1;
		$retData["message"] = $e->getMessage();
	}

	return json_encode($retData);
	}
}
?>



