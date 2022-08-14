
function groupByMonth(array) {
    const sortedObj = {};
    array.forEach(e => {               // loop over all elements
    const k = e.date.slice(0, 7);        // key in YYYY-MM (e.g. 2019-10)
    const fk = `${k}-01`;                // key with appended '-01'   
    sortedObj[fk] = sortedObj[fk] || []; // create new entry if no value for key exists
    sortedObj[fk].push(e);               // add key to existing list
    });
    console.log(sortedObj);
    const sortedArr = Object.entries(sortedObj).sort((a,b) => new Date(a[0]) - new Date(b[0]));
    console.log(sortedArr);
    return sortedObj;
};

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

// function groupByPaymentMethod(array) {
//     var result = [];
//     array.reduce(function (res, value) {
//         if (!res[value['payment method']]) {
//             res[value['payment method']] = { x: value['payment method'], y: 0 };
//             result.push(res[value['payment method']]);
//         }
//         res[value['payment method']].y += value.amount;
//         return res;
//     }, {});
//     return result;
// }

function compare(a, b) {
    if (a.x < b.x) return -1;
    if (a.x > b.x) return 1;
    return 0;
};

function accumulate(array) {
    return array.map(function (val) { return { x: val.x, y: this.acc += val.y }; }, { acc: balance });
};

function monthStart() {
    var month = parseInt(document.getElementById('monthpicker').value);
    var year = document.getElementById('yearpicker').value;
    startDate = new Date(year, month-1, 1);

    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(startDate);
    let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(startDate);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(startDate);
    let formatDate = `${ye}-${mo}-${da}`
    console.log(formatDate)
    return formatDate
};

function monthEnd(){
    var month = parseInt(document.getElementById('monthpicker').value);
    var year = document.getElementById('yearpicker').value;
    startDate = new Date(year, month, 1);

    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(startDate);
    let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(startDate);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(startDate);
    let formatDate = `${ye}-${mo}-${da}`
    console.log(formatDate)
    return formatDate
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
        // first filter the data to be expenses
        // var cost = data.filter(function (entry) { return entry.type = "Expense"; });
        var cost = data.filter((e) => e.type == 'Expense');
        console.log(cost);
        // filter to selected months data
        var thisMonth = cost.filter((e) => e.date >= monthStart() && e.date < monthEnd());
        console.log(thisMonth)
        // group the selected months data into categories
        var groupedCat = groupByCategory(thisMonth).filter((e) => e.y != 0);
        console.log(groupedCat)
        const allCats = groupedCat.map(function(index){
            return index.x;      
        })
        // Remove any duplicates
        const categories = [...new Set(allCats)];
        console.log(categories)


        expensesBar.config.data.labels = categories;
        expensesPie.config.data.labels = categories;
        
        // sum up all of the amounts per category and update the data
        const amount = groupedCat.map(function(index){
            return Math.abs(index.y);      
        })
        console.log(amount);
        
        // expensesBar.configBar.data.datasets[0].data = amount;
        // data.datasets[0].data = amount;
        expensesBar.config.data.datasets[0].data = amount;
        expensesBar.update();
        expensesPie.update();

        // get the 5 highest expenses
        const highest = 
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
        'rgba(255, 26, 104, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
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
      scales: {
        y: {
          beginAtZero: true
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