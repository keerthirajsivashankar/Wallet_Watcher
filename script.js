console.log("Wallet Watcher script loaded.");

// 1. GET THE HTML ELEMENTS
const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

// 2. RETRIEVE DATA FROM LOCAL STORAGE
// We check if there is data. If yes, parse it. If no, start with empty array [].
const localStorageTransactions = JSON.parse(
  localStorage.getItem("transactions")
);

let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

// 3. FUNCTION: ADD TRANSACTION
function addTransaction(e) {
  e.preventDefault(); // Stops the form from submitting/refreshing the page

  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Please add a text and amount");
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value, // The '+' converts the string "20" to number 20
    };

    transactions.push(transaction); // Add to our data array

    addTransactionDOM(transaction); // Add to the HTML list
    updateValues(); // Recalculate balance
    updateLocalStorage(); // Save to browser memory

    // Clear inputs
    text.value = "";
    amount.value = "";
  }
}

// 4. FUNCTION: GENERATE RANDOM ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// 5. FUNCTION: SHOW TRANSACTION IN HTML LIST
function addTransactionDOM(transaction) {
  // Get sign (is it + or -?)
  const sign = transaction.amount < 0 ? "-" : "+";

  // Create list item
  const item = document.createElement("li");

  // Add class based on value (Red for minus, Green for plus)
  // We use Tailwind classes here: border-r-4 border-red-500 etc
  item.classList.add(
    "bg-gray-700",
    "flex",
    "justify-between",
    "p-2",
    "rounded-md",
    "shadow-sm",
    "border-r-4",
    transaction.amount < 0 ? "border-red-500" : "border-green-500"
  );

  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span>
    <button class="delete-btn text-red-400 font-bold ml-2 hover:text-red-600" onclick="removeTransaction(${
      transaction.id
    })">x</button>
  `;

  list.appendChild(item);
}

// 6. FUNCTION: UPDATE BALANCE, INCOME, EXPENSE
function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);

  // Calculate Total
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  // Calculate Income (only positives)
  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  // Calculate Expense (only negatives)
  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  // Update HTML
  balance.innerText = `$${total}`;
  money_plus.innerText = `+$${income}`;
  money_minus.innerText = `-$${expense}`;
}

// 7. FUNCTION: REMOVE TRANSACTION (Optional Feature)
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  init();
}

// 8. FUNCTION: UPDATE LOCAL STORAGE
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// 9. INIT APP
function init() {
  list.innerHTML = ""; // Clear list
  transactions.forEach(addTransactionDOM); // Add items from history
  updateValues(); // Calculate totals
}

init();

// EVENT LISTENERS
form.addEventListener("submit", addTransaction);
