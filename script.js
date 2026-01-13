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
  if (tabName === "calender") {
    renderCalendar();
  }
  if (tabName === "expenses") {
    // Small timeout ensures the div is visible before Chart.js tries to draw
    setTimeout(() => {
      renderAnalytics();
    }, 50);
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

// --- 8. PROFILE ACTIONS ---

// Function to Download Data as JSON
function exportData() {
  if (transactions.length === 0) {
    alert("No data to export!");
    return;
  }

  // 1. Convert array to JSON string
  const jsonString = JSON.stringify(transactions, null, 2);

  // 2. Create a Blob (File in memory)
  const blob = new Blob([jsonString], { type: "application/json" });

  // 3. Create a download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // 4. Name the file with today's date
  const date = new Date().toISOString().split("T")[0];
  a.download = `wallet_backup_${date}.json`;

  // 5. Trigger download
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to Wipe Everything
function clearData() {
  // 1. Double check with user
  if (
    confirm(
      "⚠️ Are you sure? This will delete ALL your transactions. This cannot be undone."
    )
  ) {
    // 2. Clear Array
    transactions = [];

    // 3. Clear LocalStorage
    localStorage.removeItem("transactions");

    // 4. Update UI
    init();

    // 5. UX Feedback
    alert("App has been reset successfully.");
  }
}

// --- 9. CALENDAR LOGIC ---

let currentCalendarDate = new Date(); // Tracks the month we are viewing

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const monthYear = document.getElementById("cal-month-year");

  if (!grid || !monthYear) return;

  grid.innerHTML = ""; // Clear old days

  // 1. Set Header Text (e.g., "January 2026")
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  monthYear.innerText = `${monthNames[month]} ${year}`;

  // 2. Calculate Days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // e.g., 31

  // 3. Create Empty Slots for days before the 1st
  for (let i = 0; i < firstDayIndex; i++) {
    const emptySlot = document.createElement("div");
    grid.appendChild(emptySlot);
  }

  // 4. Create Day Buttons
  const todayStr = new Date().toISOString().split("T")[0]; // "2026-01-14"

  for (let day = 1; day <= daysInMonth; day++) {
    // Format date string "YYYY-MM-DD" to match our stored transactions
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    // Check if we have transactions on this day
    const hasData = transactions.some((t) => t.date === dateStr);

    // Check if it's today
    const isToday = dateStr === todayStr;

    const dayEl = document.createElement("div");
    dayEl.className =
      "flex flex-col items-center justify-center h-10 w-10 mx-auto relative cursor-pointer hover:bg-gray-100 rounded-full transition-colors";

    // On Click -> Show Details
    dayEl.onclick = () => showDateDetails(dateStr, day);

    // The Number
    dayEl.innerHTML = `<span class="text-sm font-medium ${
      isToday ? "text-[#fb7044] font-bold" : "text-gray-700"
    }">${day}</span>`;

    // The Dot (Indicator)
    if (hasData) {
      const dot = document.createElement("div");
      dot.className = "absolute bottom-1 w-1.5 h-1.5 bg-[#8d46f1] rounded-full"; // Purple dot
      dayEl.appendChild(dot);
    }

    // Highlight selection styling (optional logic can go here)
    grid.appendChild(dayEl);
  }
}

// Navigation Buttons (Prev/Next Month)
function changeMonth(direction) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
  renderCalendar();
}

// Show Transactions for a Selected Date
function showDateDetails(dateStr, dayNumber) {
  const listContainer = document.getElementById("calendar-list");
  const title = document.getElementById("selected-date-title");

  // 1. Update Title
  const dateObj = new Date(dateStr);
  title.innerText = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 2. Filter Transactions
  const dayTransactions = transactions.filter((t) => t.date === dateStr);

  // 3. Render List
  listContainer.innerHTML = "";

  if (dayTransactions.length === 0) {
    listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center pt-8 text-gray-400 opacity-60">
                <i class="ph ph-coffee text-3xl mb-2"></i>
                <p class="text-sm">No spending on this day</p>
            </div>
        `;
    return;
  }

  // Reuse the DOM generator we made earlier, but append to calendar list
  dayTransactions.forEach((t) => {
    const sign = t.amount < 0 ? "-" : "+";
    const item = document.createElement("li");
    const borderClass =
      t.amount < 0 ? "border-orange-500" : "border-purple-500";
    const textClass = t.amount < 0 ? "text-orange-500" : "text-purple-500";

    item.className = `bg-white p-3 rounded-xl shadow-sm border-l-4 ${borderClass} flex justify-between items-center`;
    item.innerHTML = `
            <div class="flex flex-col">
                <span class="font-bold text-gray-800 text-sm">${t.text}</span>
                <span class="text-[10px] text-gray-400 capitalize">${
                  t.category
                }</span>
            </div>
            <span class="font-bold ${textClass} text-sm">${sign}₹${Math.abs(
      t.amount
    )}</span>
        `;
    listContainer.appendChild(item);
  });
}

// --- 10. ANALYTICS / CHARTS LOGIC ---

let categoryChartInstance = null;
let trendChartInstance = null;

function renderAnalytics() {
  // 1. Prepare Data Buckets
  const categoryTotals = {};
  const monthlyTotals = {};

  transactions.forEach((t) => {
    // We only care about EXPENSES (negative amounts)
    if (t.amount < 0) {
      const amount = Math.abs(t.amount); // Convert -50 to 50

      // A. Group by Category
      const cat = t.category || "other";
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += amount;

      // B. Group by Month (Format: "Jan 2026")
      if (t.date) {
        const dateObj = new Date(t.date);
        const monthKey = dateObj.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }); // "Jan 2026"

        if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
        monthlyTotals[monthKey] += amount;
      }
    }
  });

  // 2. Render Category Chart (Doughnut)
  renderCategoryChart(categoryTotals);

  // 3. Render Trend Chart (Bar)
  renderTrendChart(monthlyTotals);

  // 4. Update "Top Expense" Card
  updateTopExpense(categoryTotals);
}

function renderCategoryChart(dataObj) {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  // Destroy old chart to avoid glitching
  if (categoryChartInstance) categoryChartInstance.destroy();

  const labels = Object.keys(dataObj).map(
    (cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
  );
  const values = Object.values(dataObj);

  // Colors matching your theme
  const colors = [
    "#fb7044", // Orange
    "#8d46f1", // Purple
    "#34354b", // Dark Gray
    "#FBBF24", // Amber
    "#10B981", // Emerald
    "#3B82F6", // Blue
    "#EC4899", // Pink
  ];

  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 20 },
        },
      },
      cutout: "70%", // Thinner ring
    },
  });
}

function renderTrendChart(dataObj) {
  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  if (trendChartInstance) trendChartInstance.destroy();

  // Sort months (This is a simple sort, for real apps you'd sort by date object)
  const labels = Object.keys(dataObj);
  const values = Object.values(dataObj);

  trendChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expenses",
          data: values,
          backgroundColor: "#fb7044",
          borderRadius: 6,
          barThickness: 20,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { display: false } },
        x: { grid: { display: false } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

function updateTopExpense(dataObj) {
  const topCatEl = document.getElementById("top-expense-category");
  const topAmtEl = document.getElementById("top-expense-amount");

  // Find the category with the highest value
  let maxVal = 0;
  let maxCat = "None";

  for (const [cat, val] of Object.entries(dataObj)) {
    if (val > maxVal) {
      maxVal = val;
      maxCat = cat;
    }
  }

  if (topCatEl) topCatEl.innerText = maxCat;
  if (topAmtEl) topAmtEl.innerText = `₹${maxVal.toFixed(2)}`;
}
