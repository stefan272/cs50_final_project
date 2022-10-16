// Helper functions =========================

// Group data array by category with a total sum for each
function groupByCategory(array) {
    var result = [];
    array.reduce(function (res, value) {
        if (!res[value['category']]) {
            res[value['category']] = { x: value['category'], sum: 0 };
            result.push(res[value['category']]);
        }
        res[value['category']].sum += value.amount;
        return res;
        }, {});
    return result;
};

// Get the start of the month date
function monthStart() {
    // Get selected month/year values from user selection
    var month = parseInt(document.getElementById('monthpicker').value);
    var year = document.getElementById('yearpicker').value;
    // Construct date object for 1st
    startDate = new Date(year, month-1, 1);

    // Format date into YYYY/mm/dd
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(startDate);
    let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(startDate);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(startDate);
    let formatDate = `${ye}-${mo}-${da}`;
    return formatDate;
};

// Get first of the next month
function monthEnd() {
    // Get selected month/year values from user selection  
    var month = parseInt(document.getElementById('monthpicker').value);
    var year = document.getElementById('yearpicker').value;
    startDate = new Date(year, month, 1);

    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(startDate);
    let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(startDate);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(startDate);
    let formatDate = `${ye}-${mo}-${da}`;
    return formatDate;
};

// Get the date of the last year
function lastYear() {
    var startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    var formatted = startDate.toISOString().slice(0, 10)
    return formatted;
};

// Chart Setup - Expenses =========================

// Fetch block
function updateChart() {
    async function fetchData() {
        const url = '/api/data';
        const response = await fetch(url);
        const data = await response.json();
        return data;
    };
    
    // Process the server data
    fetchData().then(data => {
        // Filter the data to just show the expenses
        var expensesData = data.filter((e) => e.type == 'Expense');

		// Filter out the data older than 1 year
        var lastYearDate = lastYear()
        var lastYearsData = expensesData.filter((e) => e.date >= lastYearDate);

        // Group the yearly data by category
        var groupedYearlyData = groupByCategory(lastYearsData);

        // Group the monthly data by category
        var startMonth = monthStart();
        var endMonth = monthEnd();
        var thisMonthsData = expensesData.filter((e) => e.date >= startMonth && e.date < endMonth);
        // Group the current months data by category
        var groupedThisMonthData = groupByCategory(thisMonthsData);

        // Add the averages to the monthly data object
        groupedThisMonthData.forEach((e) => {
            // Get the index of the correlating category in the yearly data array
            const index = groupedYearlyData.findIndex(object => {
                return object.x === e.x;
            });
            const yearlySum = groupedYearlyData[index].sum;
            // Add the average key/value to the monthly data object
            e['avg'] = yearlySum / 12;
            // Parse the data vales to 2 decimal places
            e.sum = (Math.abs(e.sum.toFixed(2)));
            e.avg = Math.abs((e.avg).toFixed(2));
        });

        // Sort the data by the current months amounts
        groupedThisMonthData.sort((a, b) => a.sum - b.sum);

        // Update the data field in the grid
        expensesBar.config.data.datasets[0].data = groupedThisMonthData;
        expensesBar.config.data.datasets[1].data = groupedThisMonthData;

        // Globally update the chart
        expensesBar.update();

        // Insights =========================

        // Monthly spends =====

        // Get the total spending of an average month from the last year
        var averageTotal = groupedYearlyData.reduce((total, category) => total + category.sum, 0);
        averageTotal = Math.abs(averageTotal / 12);

        // Get the total spending of the current month
        var monthlyTotal = groupedThisMonthData.reduce((total, category) => total + category.sum, 0);

        // Update the HTML elements
        document.getElementById('averageMonth').innerHTML = '£'+averageTotal.toFixed(2);
        document.getElementById('currentMonth').innerHTML = '£'+monthlyTotal.toFixed(2);
        
        // Difference =====

        // Get the difference between the average and current months
        const difference = (monthlyTotal - averageTotal).toFixed(2);
        // Update HTML elements depending on difference value
        if (monthlyTotal == 0) {
          document.getElementById('difference').innerHTML = "N/A"
        }
        else if (difference > 0) {
        document.getElementById('difference').innerHTML = "You've spent " + '£'+Math.abs(difference) + ' more than the average';
        }
        else {
        document.getElementById('difference').innerHTML = "You've spent " + '£'+ Math.abs(difference) + ' less than the average';
        };
        
        // Highest spend =====

        // Sort the months data highest to lowest
        thisMonthsData.sort((a, b) => a.amount - b.amount);
  
        // Update the HTML element
        if (thisMonthsData[0] === undefined) {
          document.getElementById('highest').innerHTML = "N/A"
        }
        else {
          document.getElementById('highest').innerHTML = "You're highest spend was " + '£' + Math.abs(thisMonthsData[0]['amount']) + ' (' + thisMonthsData[0]['description'] + ')';
        };
	  });
};

// Chart plugin setup =========================

Chart.register(ChartjsPluginStacked100.default);
Chart.register(ChartDataLabels);

// Bar chart - Expenses ============================

// Setup 
const dataExpenses = {
    // labels: [],
    datasets: [{
      label: 'Expenses',
      data: [],
      order: 1,
	  datalabels: {
		  display: false,
      anchor: 'end',
      align: 'top',

	  },
      backgroundColor: [
        'rgba(36, 40, 82, 0.8)',
        'rgba(172, 202, 249, 0.8)', 
        'rgba(74, 102, 172, 0.8)',
        'rgba(99, 157, 209, 0.8)', 
        'rgba(42, 127, 213, 0.8)',
        'rgba(128, 142, 168, 0.8)',
        'rgba(90, 162, 174, 0.8)',
        'rgba(156, 144, 160, 0.8)'
      ],
      borderColor: [
        'rgba(36, 40, 82, 1)',
        'rgba(172, 202, 249, 1)', 
        'rgba(74, 102, 172, 1)',
        'rgba(99, 157, 209, 1)', 
        'rgba(42, 127, 213, 1)',
        'rgba(128, 142, 168, 1)',
        'rgba(90, 162, 174, 1)',
        'rgba(156, 144, 160, 1)'
      ],
      borderWidth: 1,
      parsing: {
          yAxisKey: 'sum'
      }
    },{
      label: 'Average',
      hidden: true,
      data: [],
      order: 2,
	  datalabels: {
		anchor: 'start',
		  align: 'end',
		  formatter: function(value) {
			return 'Avg.\n'+'£'+value['avg'];
		  },
		  textAlign: 'center',
		  font: {
			  size: 10,
			  color: 'white',
		  },
	  },
      backgroundColor: [
        'transparent',
      ],
      borderColor: [
        'rgba(255, 0, 0, .75)',
      ],
	  plugins: {
		  tooltip: {
			  enabled: false
		  }
	  },
      borderWidth: 1,
      parsing: {
          yAxisKey: 'avg'
      }
    },
    ]
  };

// Configuration - bar chart
const configExpensesBar = {
	type: 'bar',
	data: dataExpenses,
	options: {
		plugins: [ChartDataLabels],
		parsing: {
			xAxisKey: 'x'
		},
		responsive: true,
		scales: {
			x: {
				stacked: true
			},
			y: {
				ticks: {
          // Include a pound sign in the ticks
          callback: function(value) {
              return '£' + value;
					}
				},
				grace: '5%',
				beginAtZero: true,
			}
		}
  }
};

// Render - bar chart
const expensesBar = new Chart(
  document.getElementById('expensesBar'),
  configExpensesBar
);

// Chart Setup - Balance =====================================

// Fetch block
function updateBalanceChart() {
  async function fetchData() {
      const url = '/api/data/balance';
      const response = await fetch(url);
      const data = await response.json();

      return data;
  };
  
  fetchData().then(data => {
    
    // Difference in balance since last month
    let balanceDifferenceMonthly = (data[data.length - 1].balance - data[data.length - 2].balance).toFixed(2);
    document.getElementById('balanceDifferenceMonthly').innerHTML = '£' + balanceDifferenceMonthly;
    
    // Difference in balance since last year
    let balanceDifferenceYearly = (data[data.length - 1].balance - data[data.length - 13].balance).toFixed(2);
    document.getElementById('balanceDifferenceYearly').innerHTML = '£' + balanceDifferenceYearly;
    
    // Update the data field in the grid
    balanceBar.config.data.datasets[0].data = data;
    balanceBar.config.data.datasets[1].data = data;

    // Globally update the chart
    balanceBar.update();

  });
};

// Chart Plugin Setup =========================

Chart.register(ChartDataLabels);

// Mixed Chart - Balance ============================

// Setup
const dataBalance = {
  // labels: [],
  datasets: [{
    label: 'Total',
    data: [],
  datalabels: {
    display: false,
    anchor: 'end',
    align: 'top',

  },
    backgroundColor: [
      'rgba(36, 40, 82, 0.8)',
      'rgba(172, 202, 249, 0.8)', 
      'rgba(74, 102, 172, 0.8)',
      'rgba(99, 157, 209, 0.8)', 
      'rgba(42, 127, 213, 0.8)',
      'rgba(128, 142, 168, 0.8)',
      'rgba(90, 162, 174, 0.8)',
      'rgba(156, 144, 160, 0.8)'
    ],
    borderColor: [
      'rgba(36, 40, 82, 1)',
      'rgba(172, 202, 249, 1)', 
      'rgba(74, 102, 172, 1)',
      'rgba(99, 157, 209, 1)', 
      'rgba(42, 127, 213, 1)',
      'rgba(128, 142, 168, 1)',
      'rgba(90, 162, 174, 1)',
      'rgba(156, 144, 160, 1)'
    ],
    borderWidth: 1,
    parsing: {
        yAxisKey: 'total'
    }
  },{
    label: 'Balance',
    data: [],
    type: 'line',
    order: 1,
  datalabels: {
    display: false,
    anchor: 'end',
    align: 'top',

  },
    backgroundColor: ['rgba(126, 142, 249, 0.8)'],
    tension: 0.4,
    parsing: {
        yAxisKey: 'balance'
    }
  },
]
};

// Configuration - bar chart
const configBalanceBar = {
type: 'bar',
data: dataBalance,
options: {
  plugins: [ChartDataLabels],
  parsing: {
    xAxisKey: 'date'
  },
  responsive: true,
  scales: {
    x: {
      stacked: true
    },
    y: {
      ticks: {
        // Include a pound sign in the ticks
        callback: function(value) {
            return '£' + value;
        }
      },
      grace: '5%',
      beginAtZero: true,
    }
  }
}
};

// Render - bar chart
const balanceBar = new Chart(
document.getElementById('balanceBar'),
configBalanceBar
);

// Update all chart objects when content loaded
document.addEventListener("DOMContentLoaded", updateBalanceChart());
document.addEventListener("DOMContentLoaded", updateChart());