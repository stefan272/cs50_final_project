// ================================================================== //
// Get financial data from server 
// ================================================================== //
async function fetchData() {
    const url = '/api/data';
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data
}

// ================================================================== //
// General styling variables 
// ================================================================== //
var bgC = {'red': "rgba(255, 99, 132, 0.7)", 'orange': "rgba(255, 159, 64, 0.7)", 'yellow': "rgba(255, 205, 86, 0.7)", 'green': "rgba(75, 192, 192, 0.7)", 'blue': "rgba(54, 162, 235,0.7)", 'violett': "rgba(153, 102, 255, 0.7)", 'grey': "rgba(201, 203, 207, 0.7)"};
var backgroundColorCategory = [bgC.red, bgC.orange, bgC.yellow, bgC.green, bgC.blue, bgC.violett, bgC.grey];
var cssColors =     {'first-bg-color':  '#1B161F', 'second-bg-color': '#1B2533;', 'first-font-color': 'white','second-font-color': '#21cd92'};

// ================================================================== //
// Helper functions 
// ================================================================== //
function groupByDate(array) {
    var result = [];
    array.reduce(function (res, value) {
        if (!res[value.date]) {
            res[value.date] = { x: new Date(value.date), y: 0 };
            result.push(res[value.date]);
        }
        res[value.date].y += value.amount;
        return res;
    }, {});
    return result;
}

// function groupByCategory(array) {
//     var result = [];
//     array.reduce(function (res, value) {
//         if (!res[value['product category']]) {
//             res[value['product category']] = { x: value['product category'], y: 0 };
//             result.push(res[value['product category']]);
//         }
//         res[value['product category']].y += value.amount;
//         return res;
//     }, {});
//     return result;
// }

// // function groupByPaymentMethod(array) {
// //     var result = [];
// //     array.reduce(function (res, value) {
// //         if (!res[value['payment method']]) {
// //             res[value['payment method']] = { x: value['payment method'], y: 0 };
// //             result.push(res[value['payment method']]);
// //         }
// //         res[value['payment method']].y += value.amount;
// //         return res;
// //     }, {});
// //     return result;
// // }

function compare(a, b) {
    if (a.x < b.x) return -1;
    if (a.x > b.x) return 1;
    return 0;
}

// // function accumulate(array) {
// //     return array.map(function (val) { return { x: val.x, y: this.acc += val.y }; }, { acc: balance });
// // }

// // ================================================================== //
// // Data manipulation
// // ================================================================== //

fetchData().then(data => {
    // // Split data for income and expenses
    var income = data.filter(function (entry) { return entry.amount >= 0; });
    var cost = data.filter(function (entry) { return entry.amount < 0; });
    
    // // Calculate overal totals, splitted for income and expenses, to determine relative weights
    var incomeTotals = income.reduce(function (val, data) { return val + data.amount; }, 0);
    var costTotals = cost.reduce(function (val, data) { return val + data.amount; }, 0);
    
    // // Group various data (splitted for income and expenses) by 
    // //  -- date
    var costGroupedByDate = groupByDate(cost).sort(compare);
    var incomeGroupedByDate = groupByDate(income).sort(compare);
    
});
var DataLP = {
    datasets: [
        {
            backgroundColor: bgC.green,
            data: incomeGroupedByDate
        },
        {
            backgroundColor: bgC.red,
            data: costGroupedByDate
        }
    ]
};

var optionsLP = {
    title: { display: true, text: 'Liquidity Planning', fontsize: '24'},
    legend : { display: false},
    scales : {
        xAxes: [{
            type: 'time', time: {unit: 'day'}, gridLines: {display: false}
        }],
        yAxes: [{
            ticks: {
                beginAtZero: true, userCallback: function(value) {
                    value = value.toString();
                    return '£' + value;
                }
            }
        }]
    }
};

var Mixed = document.getElementById('LiquidityPlanning').getContext('2d');
var MixedChart = new CharacterData(Mixed, {type: 'bar', data: DataLP, options: optionsLP});

// //  -- category
// var incomeGroupedByCategory = { category: groupByCategory(income).map(a => a.x), amount: groupByCategory(income).map(a => a.y) };
// var costGroupedByCategory = { category: groupByCategory(cost).map(a => a.x), amount: groupByCategory(cost).map(a => a.y) };

// // ========== Enahnce data with benchmark figures (splitted for income and expenses)
// var costGroupedByCategoryBenchmark = [];
// groupByCategory(cost).forEach((elem, i) => {
//     costGroupedByCategoryBenchmark.push({
//         label: elem.x, backgroundColor: backgroundColorCategory[i], data: [{
//             x: elem.y,
//             y: averageExpensePerCategory[elem.x],
//             r: elem.y / costTotals * 100
//         }]
//     });
// });

// var incomeGroupedByCategoryBenchmark = [];
// groupByCategory(income).forEach(elem => {
//     incomeGroupedByCategoryBenchmark.push({
//         label: elem.x, backgroundColor: 'red', borderColor: 'red', borderWidth: 1, data: [{
//             x: elem.y,
//             y: averageExpensePerCategory[elem.x],
//             r: elem.y / incomeTotals * 100
//         }]
//     });
// });

// //  -- payment methos
// var incomeGroupedByPaymentMethod = { category: groupByPaymentMethod(income).map(a => a.x), amount: groupByPaymentMethod(income).map(a => a.y / incomeTotals * 100) };
// var costGroupedByPaymentMethod = { category: groupByPaymentMethod(cost).map(a => a.x), amount: groupByPaymentMethod(cost).map(a => a.y / costTotals * 100) };

// // Group AND accumulate by 
// //  -- date
// var totalsGroupedByDate = groupByDate(FinancialData).sort(compare);
// var totalsAccGroupedByDate = accumulate(totalsGroupedByDate);