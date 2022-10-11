// import { Grid, html } from "gridjs";

document.addEventListener("DOMContentLoaded", function(){
    const tableDiv = document.getElementById('table');

    // Async function to get categories from server **NOT WORKING***
    // async function getCategories() {
    //     let url = '/api/data/categories';
    //     try {
    //         let res = await fetch(url);
    //         return await res.json();
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    // async function renderOptions() {
    //     let options = await getCategories();
    //     let html = ''
    //     options.forEach(option => {
    //         let htmlSegment = `<option>`+option+`</option>`;
    //         html += htmlSegment;
    //     });
    //     console.log(html)
    //     return html
    // };

    // let optionsHTML = renderOptions().then(function(result) {return result;});
    // console.log(optionsHTML);


    function renderOptions() {
        let options = ['Bills', 'Eating Out', 'Entertainment', 
                       'Family', 'Finances', 'Gifts (Giving)', 
                       'Gifts (Receiving)', 'Groceries', 'Holidays', 
                       'Salary', 'Personal Care', 'Savings', 'Shopping', 
                       'Transfers', 'Transport', 'General (Income)', 
                       'General (Expense)'];
        let html = '';
        options.forEach(option => {
            let htmlSegment = `<option>`+option+`</option>`;
            html += htmlSegment;
        });
        return html;
    }
    

    let optionsHTML = renderOptions();

    function renderAllOptions(id, currentCategory) {
        
        let html = `<center><select name="category" id=`+id+`><option selected>`+currentCategory+`</option>`+optionsHTML+`</select></center>`;
        return html;
    };

    function updateCategory(cat, id) {
        fetch('/api/data/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: 
            JSON.stringify({'category':cat, 'id':id}),
            }).then()
    };

    const grid = new gridjs.Grid({
        columns: [
        { id: 'transaction_id', name: 'Transaction ID', 'hidden': true },
        { id: 'date', name: 'Date' },
        { id: 'description', name: 'Description'},
        { id: 'amount', name: 'Amount', width: '20%', formatter: (cell) => `£${cell}` },
        {
            id: 'category',
            name: 'Category',
            formatter: (cell, row) => gridjs.html(renderAllOptions(row.cells[0].data, cell)),
            attributes: (cell, row) => {
                if (cell) {
                    return {
                        'data-cell-content':cell,
                        'onchange': (e) => updateCategory(e.target.value, row.cells[0].data)
                        }
                    };
                }
        },
        {
            id: 'checkbox',
            name: 'Remove',
            width: '15%',
            plugin: {
                component: gridjs.plugins.selection.RowSelection,
                props: {
                    id: (row) => row.cell(0).data
                }
            }
        }
        ],
        server: {
            url: '/api/data',
            then: results => results
        },
        search: true,
        autoWidth: true,
        width: '80%',
        sort: true,
        resizable: true,
        pagination: {
            limit: 15
        },
        style: {
            th: {
                'background-color': 'rgba(74, 102, 172, 0.5)',
                color: '#000',
                'text-align': 'center'
              },
            td: {
                'text-align': 'left',
                'word-break': 'break-word'
            }
        }
    }).render(tableDiv);

    const deleteButton = document.getElementById('delete');

    deleteButton.addEventListener('click', ev => {
        const checkboxPlugin = grid.config.plugin.get('checkbox');
        const transactionsToDelete = checkboxPlugin.props.store.state;
        console.log(transactionsToDelete);

        if (Object.values(transactionsToDelete) != NaN) {
            fetch('/api/data/delete', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: 
                JSON.stringify(Object.values(transactionsToDelete)[0]),
            }).then(() => {window.location.reload();})
        }
    });

    // https://blog.miguelgrinberg.com/post/beautiful-flask-tables-part-2

    let savedValue;

        tableDiv.addEventListener('change', ev => {
        if (ev.target.tagName === 'select') {
            savedValue = ev.target.value;
            console.log(savedValue);
        }
        });

        tableDiv.addEventListener('focusout', ev => {
        if (ev.target.tagName === 'select') {
            if (savedValue !== ev.target.textContent) {
            fetch('/api/data/update', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                id: ev.target.dataset.elementId,
                [ev.target.dataset.columnId]: ev.target.textContent
                }),
            });
            }
            savedValue = undefined;
        }
        });
});