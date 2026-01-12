# Ramillette E-Commerce Backend - Test Cases

## Critical Endpoints Test Cases

### 1. Order Placement (POST /api/order/placeOrder)
**Priority: CRITICAL** - This is the core checkout functionality

#### Test Case 1.1: Successful Order Placement
- **Description**: User places order with valid cart items
- **Preconditions**: User logged in, cart has items, valid address
- **Test Data**:
  - Valid cart array with productId, selectedVariant, qty, selectedOffer
  - Valid delivery address
  - countryId in query params
  - Valid subtotal and finalTotal
- **Expected Result**: 
  - Status: 200
  - Order created successfully
  - Stock updated
  - Cart cleared
  - Email sent (async)
- **Performance Check**: Response time < 2 seconds

#### Test Case 1.2: Order Placement with Insufficient Stock
- **Description**: User tries to order more items than available
- **Test Data**: Cart with qty > available stock
- **Expected Result**: 
  - Status: 400
  - Error message: "Not enough stock"
  - Order not created
  - Stock not updated

#### Test Case 1.3: Order Placement with Invalid Product
- **Description**: User tries to order non-existent product
- **Test Data**: Cart with invalid productId
- **Expected Result**: 
  - Status: 404
  - Error message: "Product not found"
  - Order not created

#### Test Case 1.4: Order Placement with Subtotal Mismatch
- **Description**: Frontend sends incorrect subtotal (security check)
- **Test Data**: Calculated subtotal != frontend subtotal
- **Expected Result**: 
  - Status: 400
  - Error message: "Subtotal mismatch. Please refresh cart."
  - Order not created

#### Test Case 1.5: Order Placement with New User Offer
- **Description**: New user (no previous orders) gets new user offer
- **Test Data**: User with no orders, valid newUserOffer object
- **Expected Result**: 
  - Status: 200
  - Order created with newUserOffer applied
  - Discounted price calculated correctly

### 2. Get User Orders (GET /api/order/getUserOrders)
**Priority: HIGH**

#### Test Case 2.1: Get Orders for User with Orders
- **Description**: User with existing orders fetches their orders
- **Preconditions**: User logged in, has orders
- **Expected Result**: 
  - Status: 200
  - Array of orders returned
  - Orders sorted by createdAt DESC
  - Only selected fields returned (performance optimization)
- **Performance Check**: Response time < 500ms

#### Test Case 2.2: Get Orders for User with No Orders
- **Description**: User with no orders
- **Expected Result**: 
  - Status: 200
  - Empty array returned

### 3. Get Checkout Details (GET /api/admin/products/getCheckoutDetailsWithOffers)
**Priority: CRITICAL** - Used in checkout flow

#### Test Case 3.1: Get Checkout with Cart Items
- **Description**: User with cart items gets checkout details
- **Preconditions**: User logged in, cart has items
- **Test Data**: countryId in query params
- **Expected Result**: 
  - Status: 200
  - cartItems array with product details
  - Variants, prices, offers populated
  - newUserOffer included if applicable
- **Performance Check**: Response time < 1 second

#### Test Case 3.2: Get Checkout with Empty Cart
- **Description**: User with empty cart
- **Expected Result**: 
  - Status: 200
  - cartItems: []
  - newUserOffer: null

#### Test Case 3.3: Get Checkout with Products Not Available in Country
- **Description**: Cart has products not available in selected country
- **Expected Result**: 
  - Status: 200
  - Only available products in cartItems
  - Unavailable products filtered out

### 4. Product Listing (GET /api/user/getUserBulkProduct)
**Priority: HIGH**

#### Test Case 4.1: Get All Products for Country
- **Description**: Fetch all available products for a country
- **Test Data**: Valid countryCode
- **Expected Result**: 
  - Status: 200
  - Products array with country variants
  - Price range calculated
  - Only active, non-deleted products
- **Performance Check**: Response time < 1 second

#### Test Case 4.2: Get Products with Search
- **Description**: Search products by name
- **Test Data**: countryCode and search query
- **Expected Result**: 
  - Status: 200
  - Filtered products matching search
  - Case-insensitive search

### 5. Single Product Details (GET /api/admin/products/getSingleProduct/:id)
**Priority: HIGH**

#### Test Case 5.1: Get Valid Product
- **Description**: Fetch single product by ID
- **Test Data**: Valid productId and countryCode
- **Expected Result**: 
  - Status: 200
  - Product details with variants for country
  - Price and currency info
- **Performance Check**: Response time < 500ms

#### Test Case 5.2: Get Non-Existent Product
- **Description**: Fetch product that doesn't exist
- **Expected Result**: 
  - Status: 404
  - Error message: "Product not found"

### 6. Cart Operations

#### Test Case 6.1: Add to Cart (POST /api/user/addToCart)
- **Description**: Add product to cart
- **Test Data**: Valid productId, quantity, countryId
- **Expected Result**: 
  - Status: 200
  - Item added to cart
  - Cart total updated
- **Performance Check**: Response time < 500ms

#### Test Case 6.2: Remove from Cart (POST /api/user/removeCartItem)
- **Description**: Remove product from cart
- **Expected Result**: 
  - Status: 200
  - Item removed
  - Cart total recalculated

#### Test Case 6.3: Get User Sub Cart (GET /api/user/getUserSubCart)
- **Description**: Get cart with recommendations
- **Expected Result**: 
  - Status: 200
  - Cart items or recommendations
  - Similar products if cart has items
  - Best sellers if cart is empty
- **Performance Check**: Response time < 1.5 seconds

### 7. User Authentication

#### Test Case 7.1: User Login (GET /api/user/login)
- **Description**: User logs in with valid credentials
- **Test Data**: Valid email and password in headers
- **Expected Result**: 
  - Status: 200
  - Token returned
  - User data, cart, wishlist returned
  - Order count included
- **Performance Check**: Response time < 500ms

#### Test Case 7.2: User Login with Invalid Credentials
- **Description**: User tries to login with wrong password
- **Expected Result**: 
  - Status: 401
  - Error message: "Invalid password"

#### Test Case 7.3: User Login when Blocked
- **Description**: Blocked user tries to login
- **Expected Result**: 
  - Status: 401
  - Error message: "Account has been blocked"

### 8. Performance Tests

#### Test Case 8.1: Concurrent Order Placements
- **Description**: Multiple users place orders simultaneously
- **Expected Result**: 
  - All orders processed correctly
  - Stock updates accurate
  - No race conditions
  - Response time acceptable under load

#### Test Case 8.2: Large Cart Checkout
- **Description**: User with 20+ items in cart checks out
- **Expected Result**: 
  - All items processed
  - Response time < 3 seconds
  - No timeouts

#### Test Case 8.3: Database Query Performance
- **Description**: Monitor database queries during operations
- **Expected Result**: 
  - No N+1 queries
  - Batch queries used where appropriate
  - Indexes utilized
  - Query execution time < 100ms per query

### 9. Integration Tests

#### Test Case 9.1: Complete Checkout Flow
- **Description**: Full checkout process from cart to order confirmation
- **Steps**:
  1. User adds items to cart
  2. User views checkout page (getCheckoutDetailsWithOffers)
  3. User places order (placeOrder)
  4. User views order (getUserOrders)
- **Expected Result**: 
  - All steps complete successfully
  - Data consistency maintained
  - Total flow time < 5 seconds

#### Test Case 9.2: Stock Synchronization
- **Description**: Multiple users try to buy last item
- **Expected Result**: 
  - Only one order succeeds
  - Others get stock error
  - Stock updated correctly

### 10. Error Handling Tests

#### Test Case 10.1: Missing Required Parameters
- **Description**: API called without required parameters
- **Expected Result**: 
  - Status: 400
  - Clear error message indicating missing parameter

#### Test Case 10.2: Invalid Data Types
- **Description**: API called with wrong data types
- **Expected Result**: 
  - Status: 400
  - Validation error message

#### Test Case 10.3: Database Connection Failure
- **Description**: Database unavailable
- **Expected Result**: 
  - Graceful error handling
  - Status: 500
  - Error logged

### 11. Security Tests

#### Test Case 11.1: Unauthorized Access
- **Description**: Access protected endpoints without token
- **Expected Result**: 
  - Status: 401
  - Access denied

#### Test Case 11.2: Price Manipulation Attempt
- **Description**: User tries to send incorrect prices in order
- **Expected Result**: 
  - Subtotal validation catches it
  - Status: 400
  - Order rejected

#### Test Case 11.3: SQL/NoSQL Injection Attempt
- **Description**: Malicious input in search/filter fields
- **Expected Result**: 
  - Input sanitized
  - No database injection
  - Safe query execution

## Performance Benchmarks

### Expected Response Times (Under Normal Load):
- Order Placement: < 2 seconds
- Get Orders: < 500ms
- Checkout Details: < 1 second
- Product Listing: < 1 second
- Single Product: < 500ms
- Cart Operations: < 500ms
- User Login: < 500ms

### Database Query Limits:
- Maximum queries per request: 5
- Maximum query time: 100ms
- Maximum response payload: 1MB

## Test Execution Checklist

- [ ] All critical endpoints tested
- [ ] Performance benchmarks met
- [ ] Error cases handled
- [ ] Security tests passed
- [ ] Integration flows working
- [ ] No N+1 query issues
- [ ] Database indexes utilized
- [ ] Concurrent operations stable
- [ ] Stock management accurate
- [ ] Email notifications sent (non-blocking)

## Notes

1. **Test Environment**: Use staging/test database, not production
2. **Test Data**: Use realistic test data matching production patterns
3. **Load Testing**: Use tools like Apache Bench or Artillery for concurrent tests
4. **Monitoring**: Monitor database query logs during tests
5. **Cleanup**: Clean up test data after test execution

