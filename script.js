const API_URL = "https://script.google.com/macros/s/AKfycbw-l6yeIgVGMX0rP7AKlM18VzLOs66JPfVPXS0TK8f9frihKA_7IesDarZHO_w9Ag2Pzw/exec";

let chartInstance = null;
let dashboardData = null;

async function fetchData(grade, subject) {
  const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(`${API_URL}?grade=${grade}&subject=${subject}`)}`);
  const json = await res.json();
  dashboardData = json;
  updateProficiencyDropdown(Object.keys(dashboardData));
}

function updateProficiencyDropdown(levels) {
    const select = document.getElementById("proficiency");
    select.innerHTML = "";
  
    const desiredOrder = ["Above", "AT", "Approaching", "Below"];
  
    desiredOrder.forEach(level => {
      const option = document.createElement("option");
      option.value = level;
      option.textContent = level;
  
      // Disable option if it's not in the current dataset
      if (!levels.includes(level)) {
        option.disabled = false; // <-- you can flip this to true if you want to prevent clicking it
        option.textContent += " (no data)";
      }
  
      select.appendChild(option);
    });
  
    // Auto-select first item
    select.value = desiredOrder[0];
  }

function renderChart() {
  const level = document.getElementById("proficiency").value;
  if (!dashboardData || !dashboardData[level]) {
    alert("No data found for that selection.");
    return;
  }

  const group = dashboardData[level];
  const pulled = group["Pulled"] || 0;
  const notPulled = group["Not Pulled"] || 0;
  const total = pulled + notPulled;

  document.getElementById("totalSummary").textContent = 
  `Total students at this proficiency level: ${total}`;


  const ctx = document.getElementById("chart").getContext("2d");

  if (chartInstance) chartInstance.destroy(); // Clean up before creating new chart

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Pulled", "Not Pulled"],
      datasets: [{
        label: `${level} Students`,
        data: [pulled, notPulled],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.raw} students`
          }
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'start',
          formatter: (value) => {
            const percent = total > 0 ? (value / total * 100).toFixed(1) : 0;
            return `${percent}%`;
          },
          font: {
            weight: 'bold',
            size: 14
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#e0e0e0',
            font: { size: 14, weight: 'bold' }
          },
          title: {
            display: true,
            text: "Support Status",
            color: '#e0e0e0',
            font: { size: 16, weight: '600' }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#e0e0e0',
            font: { size: 12 }
          },
          title: {
            display: true,
            text: "Number of Students",
            color: '#e0e0e0',
            font: { size: 16, weight: '600' }
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

document.getElementById("clearChart").addEventListener("click", () => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  
    // Optional: Reset dropdowns to defaults
    document.getElementById("proficiency").selectedIndex = 0;
  });
  
  function clearChart() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  
    // Reset the total summary text
    document.getElementById("totalSummary").textContent = "";
  
    // Optionally reset the proficiency dropdown
    const profSelect = document.getElementById("proficiency");
    if (profSelect) {
      profSelect.selectedIndex = 0;
    }
  }
  

// When grade or subject changes, fetch new data
["grade", "subject"].forEach(id =>
  document.getElementById(id).addEventListener("change", () => {
    const grade = document.getElementById("grade").value;
    const subject = document.getElementById("subject").value;
    fetchData(grade, subject);
  })
);

// Show Data button triggers chart render
const showDataButton = document.getElementById("showData");
if (showDataButton) {
  showDataButton.addEventListener("click", () => {
    renderChart();
  });

  document.getElementById("clearChart").addEventListener("click", () => {
    clearChart();
  });
  
}

// Initial data load
fetchData("6thData", "ela");
