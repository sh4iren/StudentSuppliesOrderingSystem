// Product prices and transaction amounts are stored as integer centavos.
const products = [
    { id: 1, name: "Ballpen", price: 1200, icon: "🖊️" },
    { id: 2, name: "Pencil", price: 1000, icon: "✏️" },
    { id: 3, name: "Notebook", price: 3500, icon: "📓" },
    { id: 4, name: "Yellow Pad", price: 4500, icon: "📄" },
    { id: 5, name: "Eraser", price: 800, icon: "◻️" },
    { id: 6, name: "Ruler", price: 1500, icon: "📏" }
];

let cart = [];
let currentReceipt = null;
let transactionCompleted = false;

const productListElement = document.querySelector("#product-list");
const cartItemsElement = document.querySelector("#cart-items");
const cartCountElement = document.querySelector("#cart-count");
const orderTotalElement = document.querySelector("#order-total");
const paymentFormElement = document.querySelector("#payment-form");
const amountPaidInput = document.querySelector("#amount-paid");
const paymentErrorElement = document.querySelector("#payment-error");
const confirmPaymentButton = document.querySelector("#confirm-payment");
const receiptPanelElement = document.querySelector("#receipt-panel");
const receiptContentElement = document.querySelector("#receipt-content");
const newTransactionButton = document.querySelector("#new-transaction");
const printReceiptButton = document.querySelector("#print-receipt");

function formatCurrency(amountInCentavos) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amountInCentavos / 100);
}

function getProductById(productId) {
    return products.find(product => product.id === productId);
}

function calculateItemSubtotal(productId, quantity) {
    const product = getProductById(productId);
    return product ? product.price * quantity : 0;
}

function calculateTotal() {
    return cart.reduce((total, item) => {
        return total + calculateItemSubtotal(item.productId, item.quantity);
    }, 0);
}

function getCartQuantity() {
    return cart.reduce((quantity, item) => quantity + item.quantity, 0);
}

function renderProducts() {
    productListElement.replaceChildren();

    products.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const illustration = document.createElement("div");
        illustration.className = "product-illustration";
        illustration.setAttribute("aria-hidden", "true");
        illustration.textContent = product.icon;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = formatCurrency(product.price);

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "button button-primary button-full";
        addButton.textContent = "Add to Cart +";
        addButton.addEventListener("click", () => addToCart(product.id));

        card.append(illustration, name, price, addButton);
        productListElement.append(card);
    });
}

function addToCart(productId) {
    if (transactionCompleted) return;

    const product = getProductById(productId);
    if (!product) return;

    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }

    clearPaymentError();
    renderCart();
}

function updateQuantity(productId, amount) {
    if (transactionCompleted) return;

    const cartItem = cart.find(item => item.productId === productId);
    if (!cartItem) return;

    const updatedQuantity = cartItem.quantity + amount;

    if (updatedQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    cartItem.quantity = updatedQuantity;
    clearPaymentError();
    renderCart();
}

function removeFromCart(productId) {
    if (transactionCompleted) return;

    cart = cart.filter(item => item.productId !== productId);
    clearPaymentError();
    renderCart();
}

function renderCart() {
    cartItemsElement.replaceChildren();
    cartCountElement.textContent = String(getCartQuantity());
    orderTotalElement.textContent = formatCurrency(calculateTotal());

    if (cart.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const icon = document.createElement("span");
        icon.className = "empty-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "+";

        const heading = document.createElement("strong");
        heading.textContent = "Your cart is empty";

        const message = document.createElement("p");
        message.textContent = "Add a product to get started.";

        emptyState.append(icon, heading, message);
        cartItemsElement.append(emptyState);
    } else {
        cart.forEach(item => {
            const product = getProductById(item.productId);
            if (!product) return;

            const row = document.createElement("div");
            row.className = "cart-item";

            const details = document.createElement("div");
            const name = document.createElement("p");
            name.className = "cart-item-name";
            name.textContent = product.name;

            const unitPrice = document.createElement("div");
            unitPrice.className = "cart-item-unit";
            unitPrice.textContent = `${formatCurrency(product.price)} each`;

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";

            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.className = "quantity-button";
            decreaseButton.textContent = "−";
            decreaseButton.setAttribute("aria-label", `Decrease ${product.name} quantity`);
            decreaseButton.disabled = transactionCompleted;
            decreaseButton.addEventListener("click", () => updateQuantity(product.id, -1));

            const quantity = document.createElement("span");
            quantity.className = "quantity-value";
            quantity.textContent = String(item.quantity);
            quantity.setAttribute("aria-label", "Quantity");

            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.className = "quantity-button";
            increaseButton.textContent = "+";
            increaseButton.setAttribute("aria-label", `Increase ${product.name} quantity`);
            increaseButton.disabled = transactionCompleted;
            increaseButton.addEventListener("click", () => updateQuantity(product.id, 1));

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-button";
            removeButton.textContent = "Remove";
            removeButton.disabled = transactionCompleted;
            removeButton.addEventListener("click", () => removeFromCart(product.id));

            controls.append(decreaseButton, quantity, increaseButton, removeButton);
            details.append(name, unitPrice, controls);

            const subtotal = document.createElement("div");
            subtotal.className = "cart-item-subtotal";
            subtotal.textContent = formatCurrency(calculateItemSubtotal(product.id, item.quantity));

            row.append(details, subtotal);
            cartItemsElement.append(row);
        });
    }

    confirmPaymentButton.disabled = transactionCompleted || cart.length === 0;
    amountPaidInput.disabled = transactionCompleted;
}

function clearPaymentError() {
    paymentErrorElement.textContent = "";
    amountPaidInput.removeAttribute("aria-invalid");
}

function showPaymentError(message) {
    paymentErrorElement.textContent = message;
    amountPaidInput.setAttribute("aria-invalid", "true");
    amountPaidInput.focus();
}

function validatePayment(rawAmount) {
    if (cart.length === 0) {
        return { valid: false, message: "Please add at least one product to your cart." };
    }

    if (rawAmount.trim() === "") {
        return { valid: false, message: "Please enter the amount paid." };
    }

    // Accept a non-negative amount with at most two decimal places.
    // Commas and currency symbols are intentionally not accepted in the input.
    if (!/^\d+(\.\d{1,2})?$/.test(rawAmount.trim())) {
        return { valid: false, message: "Enter a valid amount, such as 100 or 100.50." };
    }

    const amountInPesos = Number(rawAmount);
    if (!Number.isFinite(amountInPesos)) {
        return { valid: false, message: "The payment amount must be a valid number." };
    }

    if (amountInPesos < 0) {
        return { valid: false, message: "The payment amount cannot be negative." };
    }

    const amountInCentavos = Math.round(amountInPesos * 100);
    const total = calculateTotal();

    if (amountInCentavos < total) {
        return {
            valid: false,
            message: `Insufficient payment. Please enter at least ${formatCurrency(total)}.`
        };
    }

    return { valid: true, amountInCentavos };
}

function createTransactionReference() {
    const datePart = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `TXN-${datePart}-${randomPart}`;
}

function processPayment(event) {
    event.preventDefault();

    if (transactionCompleted) return;

    clearPaymentError();

    const validation = validatePayment(amountPaidInput.value);
    if (!validation.valid) {
        showPaymentError(validation.message);
        return;
    }

    const total = calculateTotal();
    const amountPaid = validation.amountInCentavos;

    // Save a snapshot so the receipt remains unchanged after the cart is reset.
    const purchasedItems = cart.map(item => {
        const product = getProductById(item.productId);
        return {
            productId: product.id,
            name: product.name,
            unitPrice: product.price,
            quantity: item.quantity,
            subtotal: product.price * item.quantity
        };
    });

    currentReceipt = {
        referenceNumber: createTransactionReference(),
        date: new Date(),
        items: purchasedItems,
        total,
        amountPaid,
        change: amountPaid - total,
        status: "completed"
    };

    transactionCompleted = true;
    renderCart();
    renderReceipt(currentReceipt);
}

function renderReceipt(receipt) {
    receiptContentElement.replaceChildren();

    const meta = document.createElement("div");
    meta.className = "receipt-meta";

    const referenceBlock = document.createElement("div");
    referenceBlock.textContent = "TRANSACTION REFERENCE";
    const referenceValue = document.createElement("strong");
    referenceValue.textContent = receipt.referenceNumber;
    referenceBlock.append(referenceValue);

    const dateBlock = document.createElement("div");
    dateBlock.textContent = "DATE & TIME";
    const dateValue = document.createElement("strong");
    dateValue.textContent = receipt.date.toLocaleString("en-PH", {
        year: "numeric", month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
    });
    dateBlock.append(dateValue);
    meta.append(referenceBlock, dateBlock);

    const table = document.createElement("table");
    table.className = "receipt-table";
    const tableHead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Product", "Qty", "Unit Price", "Subtotal"].forEach((headingText, index) => {
        const heading = document.createElement("th");
        heading.textContent = headingText;
        if (index === 2) heading.className = "unit-price-heading";
        headerRow.append(heading);
    });

    tableHead.append(headerRow);
    const tableBody = document.createElement("tbody");

    receipt.items.forEach(item => {
        const row = document.createElement("tr");
        const values = [
            item.name,
            String(item.quantity),
            formatCurrency(item.unitPrice),
            formatCurrency(item.subtotal)
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });
        tableBody.append(row);
    });

    table.append(tableHead, tableBody);

    const totals = document.createElement("div");
    totals.className = "receipt-totals";
    totals.append(
        createReceiptTotalRow("Total amount due", formatCurrency(receipt.total), true),
        createReceiptTotalRow("Amount paid", formatCurrency(receipt.amountPaid)),
        createReceiptTotalRow("Change", formatCurrency(receipt.change))
    );

    const confirmation = document.createElement("div");
    confirmation.className = "receipt-confirmation";
    confirmation.textContent = "✓ Payment successful. Your order is complete.";

    receiptContentElement.append(meta, table, totals, confirmation);
    receiptPanelElement.classList.remove("hidden");
    receiptPanelElement.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createReceiptTotalRow(labelText, amountText, isFinal = false) {
    const row = document.createElement("div");
    row.className = isFinal ? "receipt-total-row final" : "receipt-total-row";

    const label = document.createElement("span");
    label.textContent = labelText;

    const amount = document.createElement("strong");
    amount.textContent = amountText;

    row.append(label, amount);
    return row;
}

function startNewTransaction() {
    cart = [];
    currentReceipt = null;
    transactionCompleted = false;
    amountPaidInput.value = "";
    clearPaymentError();
    receiptContentElement.replaceChildren();
    receiptPanelElement.classList.add("hidden");
    renderCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

paymentFormElement.addEventListener("submit", processPayment);
newTransactionButton.addEventListener("click", startNewTransaction);
printReceiptButton.addEventListener("click", () => {
    if (currentReceipt) window.print();
});

// Initial application rendering.
renderProducts();
renderCart();
