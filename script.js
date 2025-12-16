console.log("Wallet Watcher script loaded.");

// --- 1. STATE MANAGEMENT ---
// Load transactions from storage or start empty
const localStorageTransactions = JSON.parse(
  localStorage.getItem("transactions")
);
let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

// --- 2. DOM ELEMENTS ---
const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");

// --- 3. TAB LOGIC ---
function switchTab(tabName) {
  // Hide all contents
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden");
  });

  // Show selected content
  const selectedTab = document.getElementById("tab-" + tabName);
  if (selectedTab) {
    selectedTab.classList.remove("hidden");
  }

  // Update Buttons (Gray vs Orange)
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("text-orange-500");
    btn.classList.add("text-gray-400");
  });

  const activeBtn = document.getElementById("btn-" + tabName);
  if (activeBtn) {
    activeBtn.classList.remove("text-gray-400");
    activeBtn.classList.add("text-orange-500");
  }

  // Update Header Title
  const title = tabName.charAt(0).toUpperCase() + tabName.slice(1);
  const titleEl = document.getElementById("tabName");
  if (titleEl) titleEl.innerText = title;

  // If going to Home, refresh the data display
  if (tabName === "home") {
    init();
  }
}

// --- 4. TOGGLE SWITCH LOGIC (Expense/Income) ---
function setType(type) {
  const bg = document.getElementById("toggle-bg");
  const btnExpense = document.getElementById("btn-type-expense");
  const btnIncome = document.getElementById("btn-type-income");
  const hiddenInput = document.getElementById("trans-type");
  const submitBtn = document.getElementById("submit-btn");

  hiddenInput.value = type;

  if (type === "expense") {
    bg.style.transform = "translateX(0%)";
    bg.style.backgroundColor = "#fb7044";

    btnExpense.classList.add("text-white");
    btnExpense.classList.remove("text-gray-500");
    btnIncome.classList.add("text-gray-500");
    btnIncome.classList.remove("text-white");

    submitBtn.style.backgroundColor = "#fb7044";
    submitBtn.classList.add("shadow-orange-200");
    submitBtn.classList.remove("shadow-purple-200");
  } else {
    bg.style.transform = "translateX(100%)";
    bg.style.backgroundColor = "#8d46f1";

    btnIncome.classList.add("text-white");
    btnIncome.classList.remove("text-gray-500");
    btnExpense.classList.add("text-gray-500");
    btnExpense.classList.remove("text-white");

    submitBtn.style.backgroundColor = "#8d46f1";
    submitBtn.classList.add("shadow-purple-200");
    submitBtn.classList.remove("shadow-orange-200");
  }
}

// --- 5. ADD TRANSACTION LOGIC ---
function addTransaction(e) {
  e.preventDefault();

  const text = document.getElementById("text");
  const amount = document.getElementById("amount");
  const date = document.getElementById("date");
  const category = document.getElementById("category");
  const type = document.getElementById("trans-type").value;

  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Please add a description and amount");
    return;
  }

  const rawAmount = +amount.value;
  // If expense, make negative. If income, make positive.
  const finalAmount =
    type === "expense" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

  const transaction = {
    id: generateID(),
    text: text.value,
    amount: finalAmount,
    date: date.value,
    category: category.value,
    type: type,
  };

  transactions.push(transaction);

  updateLocalStorage();

  // Clear inputs
  text.value = "";
  amount.value = "";

  // UX: Switch back to home to see the result
  switchTab("home");
}

// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// --- 6. DISPLAY & CALCULATE LOGIC ---

function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  if (balance) balance.innerText = `₹${total}`;
  if (money_plus) money_plus.innerText = `+₹${income}`;
  if (money_minus) money_minus.innerText = `-₹${expense}`;
}

function addTransactionDOM(transaction) {
  if (!list) return; // Safety check

  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");

  // Styling based on Income/Expense
  const borderClass =
    transaction.amount < 0 ? "border-orange-500" : "border-purple-500";
  const textClass =
    transaction.amount < 0 ? "text-orange-500" : "text-purple-500";
  const icon =
    transaction.amount < 0 ? "ph-arrow-down-right" : "ph-arrow-up-right";

  item.className = `bg-white p-4 rounded-xl shadow-sm border-l-4 ${borderClass} flex justify-between items-center`;

  item.innerHTML = `
        <div class="flex flex-col">
            <span class="font-bold text-gray-800">${transaction.text}</span>
            <span class="text-xs text-gray-400 capitalize">${
              transaction.category || "General"
            } • ${transaction.date || "No Date"}</span>
        </div>
        <div class="flex items-center gap-2">
            <span class="font-bold ${textClass}">${sign}₹${Math.abs(
    transaction.amount
  )}</span>
            <button onclick="removeTransaction(${
              transaction.id
            })" class="text-gray-300 hover:text-red-500 transition-colors">
                <i class="ph ph-trash"></i>
            </button>
        </div>
    `;

  list.appendChild(item);
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  init();
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function init() {
  if (list) list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

// --- 7. EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  // Set default date
  const dateInput = document.getElementById("date");
  if (dateInput) dateInput.valueAsDate = new Date();

  // Initialize App
  init();
});

if (form) {
  form.addEventListener("submit", addTransaction);
}
