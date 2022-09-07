// Fetch block
function updateChart() {
    async function fetchData() {
        const url = '/test';
        const response = await fetch(url);
        const data = await response.json();
        // console.log(data);
        return data;
    };
    
    fetchData().then(data => {
        // Filter the data to just show the expenses
        var expensesData = data
        console.log(expensesData); 
        // var grpdDate = groupByDate(expensesData);
        // console.log(grpdDate);
		//     // Filter out the data older than 1 year
        // var lastYearDate = lastYear()
        // var lastYearsData = expensesData.filter((e) => e.date >= lastYearDate);
        // // console.log(lastYearsData);

        // // Group the yearly data by category
        // var groupedYearlyData = groupByCategory(lastYearsData);
        // // console.log(groupedYearlyData);

        // // Group the monthly data by category
        // var startMonth = monthStart();
        // var endMonth = monthEnd();
        // var thisMonthsData = expensesData.filter((e) => e.date >= startMonth && e.date < endMonth);
        // // Group this months data by category
        // var groupedThisMonthData = groupByCategory(thisMonthsData);

        // // Add the averages to the monthly data object
        // groupedThisMonthData.forEach((e) => {
        //     // Get the index of the correlating category in the yearly data array
        //     const index = groupedYearlyData.findIndex(object => {
        //         return object.x === e.x;
        //     });
        //     const yearlySum = groupedYearlyData[index].sum;
        //     // Add the average key/value to the monthly data object
        //     e['avg'] = yearlySum / 12;
        //     // Parse the data vales to 2 decimal places
        //     e.sum = (Math.abs(e.sum.toFixed(2)));
        //     e.avg = Math.abs((e.avg).toFixed(2));
        // });

        
        // // Sort the data by the current months amounts
        // groupedThisMonthData.sort((a, b) => a.sum - b.sum);
        // // console.log(groupedThisMonthData)

        // // Update the data field in the grid
        // balanceBar.config.data.datasets[0].data = groupedThisMonthData;

        // // Globally update the chart
        // balanceBar.update();

	  });
};

//   Chart Setup =========================

Chart.register(ChartjsPluginStacked100.default);
Chart.register(ChartDataLabels);

//   Bar chart============================

// Setup 
const dataBalance = {
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
    },
    ]
  };

// config - bar chart
const configBalanceBar = {
	type: 'bar',
	data: dataBalance,
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

// render bar chart block
const balanceBar = new Chart(
  document.getElementById('balanceBar'),
  configBalanceBar
);

//   =====================================

document.addEventListener("DOMContentLoaded", updateChart());