// INSIDE script.js
console.log("Wallet Watcher script loaded.");

function switchTab(tabName) {
  // 1. Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden");
  });

  // 2. Show the selected tab content
  const selectedTab = document.getElementById("tab-" + tabName);
  if (selectedTab) {
    selectedTab.classList.remove("hidden");
  }

  // 3. Reset all nav buttons to GRAY (Inactive)
  // We use .nav-btn class now (instead of .tab-btn)
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("text-orange-500"); // Remove active orange
    btn.classList.add("text-gray-400"); // Add inactive gray
  });

  // 4. Highlight the active button to ORANGE
  // (We skip this if the user clicked the big "Add" button, as it has no ID/text color to change)
  const activeBtn = document.getElementById("btn-" + tabName);
  if (activeBtn) {
    activeBtn.classList.remove("text-gray-400");
    activeBtn.classList.add("text-orange-500");
  }

  // 5. Update Header Title
  // Capitalize first letter: 'home' -> 'Home'
  const title = tabName.charAt(0).toUpperCase() + tabName.slice(1);
  document.getElementById("tabName").innerText = title;
}

// Inside addTransaction(e) function...

const transaction = {
  id: generateID(),
  text: text.value,
  amount: +amount.value,
  date: document.getElementById("date").value, // <--- NEW: Save the date!
};

let myChart; // Global variable to hold the chart instance

function renderChart() {
  const ctx = document.getElementById("expenseChart");

  // 1. Prepare Data Buckets
  // We want an object like: { "2023-10": 500, "2023-11": 1200 }
  const monthlyTotals = {};

  transactions.forEach((txn) => {
    // Only look at Expenses (negative numbers)
    if (txn.amount < 0 && txn.date) {
      // Extract "YYYY-MM" from date string "2025-12-15"
      const monthKey = txn.date.substring(0, 7);

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = 0;
      }
      // Add absolute value (convert -20 to 20)
      monthlyTotals[monthKey] += Math.abs(txn.amount);
    }
  });

  // 2. Sort the Labels (so Jan comes before Feb)
  const sortedMonths = Object.keys(monthlyTotals).sort();
  const dataValues = sortedMonths.map((month) => monthlyTotals[month]);

  // 3. Destroy old chart if it exists (prevents glitching when you update data)
  if (myChart) {
    myChart.destroy();
  }

  // 4. Create New Chart
  myChart = new Chart(ctx, {
    type: "bar", // Can be 'line', 'bar', 'doughnut'
    data: {
      labels: sortedMonths, // ["2025-10", "2025-11"]
      datasets: [
        {
          label: "Expenses",
          data: dataValues, // [500, 1200]
          backgroundColor: "#f97316", // Orange-500
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// IMPORTANT: Add renderChart() to your init() and addTransaction() functions
// so it updates whenever you load the page or add an item.
