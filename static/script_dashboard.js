// Group data array by month
function groupByMonth(array) {
    const sortedObj = {};
    array.forEach(e => {               // loop over all elements
    const k = e.date.slice(0, 7);        // key in YYYY-MM (e.g. 2019-10)
    const fk = `${k}-01`;                // key with appended '-01'   
    sortedObj[fk] = sortedObj[fk] || []; // create new entry if no value for key exists
    sortedObj[fk].push(e);               // add key to existing list
    });
    const sortedArr = Object.entries(sortedObj).sort((a,b) => new Date(a[0]) - new Date(b[0]));
    console.log(sortedArr);
    return sortedObj;
};

// Group data array by category
function groupByCategory(array) {
    var result = [];
    array.reduce(function (res, value) {
    if (!res[value['category']]) {
        res[value['category']] = { x: value['category'], y: 0 };
        result.push(res[value['category']]);
    }
    res[value['category']].y += value.amount;
    return res;
    }, {});
    return result;
};

// Average categories expenses over last year
function averageYear(array) {
    array.forEach((e) => {
        e.z = e.y / 12
    }
    );
    return array;
};

function compare(a, b) {
    if (a.x < b.x) return -1;
    if (a.x > b.x) return 1;
    return 0;
};

// Get the start of the month data
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
    console.log(formatDate);
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
    console.log(formatDate);
    return formatDate;
};

// Get the date of the last year
function lastYear() {
    var startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    var formatted = startDate.toISOString().slice(0, 10)
    console.log(formatted)
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
        var cost = data.filter((e) => e.type == 'Expense');
        // Filter the data more to get the selected months transactions
        var startMonth = monthStart();
        var endMonth = monthEnd();
        var thisMonth = cost.filter((e) => e.date >= startMonth && e.date < endMonth);
        // Group the months transactions by category
        var groupedCat = groupByCategory(thisMonth).filter((e) => e.y != 0);
        // Filter the transactions by the last year
        var currentDate = new Date().toISOString().slice(0, 10);
        var lastYearDate = lastYear();
        var thisYear = cost.filter((e) => e.date >= lastYearDate && e.date < currentDate);
        // groupedYear
        var groupedYear = groupByCategory(thisYear).filter((e) => e.y != 0);
        const averages = groupedYear.map(function(index){
            return Math.abs(index.y/12);
        });
        console.log(groupedYear);
        console.log(averages);

        // Get a list of the months relevant categories
        const allCats = groupedCat.map(function(index){
            return index.x;      
        })
        // Remove any duplicates from the categories
        const categories = [...new Set(allCats)];
        // Update the chart data labels with the categories
        expensesBar.config.data.labels = categories;
        expensesPie.config.data.labels = categories;
        
        // Sum up all of the amounts per category and update the data
        const amount = groupedCat.map(function(index){
            return Math.abs(index.y);      
        }).sort((a, b) => a - b);
        console.log(amount)
        // Update the chart data with the amounts
        expensesBar.config.data.datasets[0].data = amount;
        expensesBar.config.data.datasets[1].data = averages;
        
        // Globally update the charts
        expensesBar.update();
        expensesPie.update();

    });
};

// Chart setup =================================

// =================================
// Bar chart

// setup 
const data = {
    labels: [],
    datasets: [{
      label: 'Expenses',
      data: [],
      backgroundColor: [
        'rgba(255, 26, 104, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)',
        'rgba(0, 0, 0, 0.2)'
      ],
      borderColor: [
        'rgba(255, 26, 104, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(0, 0, 0, 1)'
      ],
      borderWidth: 1
    },
    {
        label: 'Averages',
        data: [],
        backgroundColor: [
          'rgba(255, 26, 104, 0.05)',
          'rgba(54, 162, 235, 0.05)',
          'rgba(255, 206, 86, 0.05)',
          'rgba(75, 192, 192, 0.05)',
          'rgba(153, 102, 255, 0.05)',
          'rgba(255, 159, 64, 0.05)',
          'rgba(0, 0, 0, 0.2)'
        ],
        borderColor: [
          'rgba(255, 26, 104, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(0, 0, 0, 1)'
        ],
        borderWidth: 1
      }]
  };

  // config - bar chart
  const configBar = {
    type: 'bar',
    data,
    options: {
        responsive: true,
        scales: {
            x: {
                stacked: true
            },
            y: {
                beginAtZero: true,
                stacked: false 
            }
        }
    }
  };
  
  // render bar chart block
  const expensesBar = new Chart(
    document.getElementById('expensesBar'),
    configBar
  );

//   ========================

// ==========================
// Pie chart

// config
const configPie = {
    type: 'doughnut',
    data,
    options: {
        responsive: true,
        hoverOffset: 4
        // radius: 200
    }
  };

// render pie chart block
const expensesPie = new Chart(
    document.getElementById('expensesPie'),
    configPie
  );

//   =====================


document.addEventListener("DOMContentLoaded", updateChart());