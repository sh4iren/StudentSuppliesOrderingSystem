# Student Supplies Ordering System

A browser-based school supplies ordering application built with HTML, CSS, and vanilla JavaScript.

## Features
- Displays six predefined school supplies and prices.
- Adds products to a shopping cart.
- Increases, decreases, and removes cart items.
- Calculates item subtotals and the total amount due.
- Validates cash payments and rejects blank, malformed, negative, or insufficient amounts.
- Calculates change and generates a digital receipt after successful payment.
- Starts a new transaction and can print the receipt.

## Run the application
1. Keep `index.html`, `style.css`, and `script.js` in the same folder.
2. Open `index.html` in a modern web browser.
3. Add items to the cart, enter the cash amount, and select **Confirm Payment**.

No database, account, framework, or build step is required.

## Notes
- Prices and payment values are calculated in integer centavos to avoid common floating-point currency issues.
- Cart and transaction data are held in browser memory. Refreshing the page clears the current transaction.
- The Google Fonts import is optional; the page uses fallback fonts if the external font service is unavailable.
