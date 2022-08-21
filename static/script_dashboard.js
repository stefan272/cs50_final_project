// Group data array by category
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
    // console.log(formatDate);
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
    // console.log(formatDate);
    return formatDate;
};

// Get the date of the last year
function lastYear() {
    var startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    var formatted = startDate.toISOString().slice(0, 10)
    // console.log(formatted)
    return formatted;
};


// Fetch block
function updateChart() {
    async function fetchData() {
        const url = '/api/data';
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data;
    };
    
    fetchData().then(data => {
        // Filter the data to just show the expenses
        var expensesData = data.filter((e) => e.type == 'Expense');
        console.log(expensesData);

		// Filter out the data older than 1 year
        var lastYearDate = lastYear()
        var lastYearsData = expensesData.filter((e) => e.date >= lastYearDate);
        console.log(lastYearsData);

        // Group the yearly data by category
        var groupedYearlyData = groupByCategory(lastYearsData);
        console.log(groupedYearlyData);

        // Group the monthly data by category
        var startMonth = monthStart();
        var endMonth = monthEnd();
        var thisMonthsData = expensesData.filter((e) => e.date >= startMonth && e.date < endMonth);
        // Group this months data by category
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
        console.log(groupedThisMonthData)

        // Update the data field in the grid
        expensesBar.config.data.datasets[0].data = groupedThisMonthData;
        expensesBar.config.data.datasets[1].data = groupedThisMonthData;

        // Globally update the chart
        expensesBar.update();

		// Insights
		// Monthly spends
		console.log(groupedThisMonthData);
		var monthlyTotal = 0;
		var averageTotal = 0;
		groupedThisMonthData.forEach(e => {
			monthlyTotal += e.sum;
			averageTotal += e.avg;
		});
		console.log(monthlyTotal);
		console.log(averageTotal);
		document.getElementById('averageMonth').innerHTML = '£'+averageTotal.toFixed(2);
		document.getElementById('currentMonth').innerHTML = '£'+monthlyTotal.toFixed(2);
    const difference = (monthlyTotal - averageTotal).toFixed(2);
    console.log(difference)
    if (difference >= 0) {
      document.getElementById('difference').innerHTML = '£'+Math.abs(difference) + ' more ';
    }
    else {
      document.getElementById('difference').innerHTML = '£'+ Math.abs(difference) + ' less ';
    }
    });
};

//   Chart Setup =========================

Chart.register(ChartjsPluginStacked100.default);
Chart.register(ChartDataLabels);

//   Bar chart============================

// Setup 
const dataExpenses = {
    // labels: [],
    datasets: [{
      label: 'Expenses',
      data: [],
      order: 1,
	  datalabels: {
		  display: false,
	  },
      backgroundColor: [
        'rgba(126, 142, 249, 0.8)',
        'rgba(145, 126, 249, 0.8)', 
        'rgba(164, 110, 249, 0.8)',
        'rgba(184, 95, 249, 0.8)', 
        'rgba(204, 76, 250, 0.8)',
        'rgba(144, 117, 185, 0.8)',
        'rgba(118, 137, 150, 0.8)',
        'rgba(95, 160, 110, 0.8)',
        'rgba(27, 199, 53, 0.8)'
      ],
      borderColor: [
        'rgba(126, 142, 249, 1)',
        'rgba(145, 126, 249, 1)', 
        'rgba(164, 110, 249, 1)',
        'rgba(184, 95, 249, 1)', 
        'rgba(204, 76, 250, 1)',
        'rgba(144, 117, 185, 1)',
        'rgba(118, 137, 150, 1)',
        'rgba(95, 160, 110, 1)',
        'rgba(27, 199, 53, 1)'
      ],
      borderWidth: 1,
      parsing: {
          yAxisKey: 'sum'
      }
    },{
      label: 'Average',
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
	//   borderDash: [1,1],
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

// config - bar chart
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
                    // Include a dollar sign in the ticks
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

// render bar chart block
const expensesBar = new Chart(
  document.getElementById('expensesBar'),
  configExpensesBar
);

//   =====================================

document.addEventListener("DOMContentLoaded", updateChart());