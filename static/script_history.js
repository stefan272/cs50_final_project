document.addEventListener("DOMContentLoaded", function(){
    const tableDiv = document.getElementById('table');

    // Create drop-down categories options for HTML
    function renderOptions() {
        let options = ['Bills', 'Eating Out', 'Entertainment', 
                       'Family', 'Finances', 'Gifts (Giving)', 
                       'Gifts (Receiving)', 'Groceries', 'Holidays', 
                       'Salary', 'Personal Care', 'Savings', 'Shopping', 
                       'Transfers', 'Transport', 'General (Income)', 
                       'General (Expense)'];
        let html = '';
        // For each option, create a HTML option string and combine them into a single HTML single
        options.forEach(option => {
            let htmlSegment = `<option>`+option+`</option>`;
            html += htmlSegment;
        });
        return html;
    };
    
    // Call the function to create HTML string of all given categories
    let optionsHTML = renderOptions();

    // Compile the current category with the list of all available categories
    function renderAllOptions(id, currentCategory) {  
        let html = `<center><select name="category" id=`+id+`><option selected>`+currentCategory+`</option>`+optionsHTML+`</select></center>`;
        return html;
    };

    // Function to update the category of a transaction via user input
    function updateCategory(cat, id) {
        fetch('/api/data/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: 
            JSON.stringify({'category':cat, 'id':id}),
            }).then()
    };

    // Create the history table
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
        // Table data is fetched from server
        server: {
            url: '/api/data',
            then: results => results
        },
        // Table feature/style options
        search: true,
        autoWidth: true,
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

    // Allow for transaction deletion by user
    const deleteButton = document.getElementById('delete');

    // On button click, selected transactions are deleted
    deleteButton.addEventListener('click', ev => {
        const checkboxPlugin = grid.config.plugin.get('checkbox');
        const transactionsToDelete = checkboxPlugin.props.store.state;
  
        // If a checkbox is ticked, pass the transaction ID to the server for deletion
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

    // For category change of transaction
    let savedValue;

    // When a field is changed, the new selected category name is stored
    tableDiv.addEventListener('change', ev => {
    if (ev.target.tagName === 'select') {
        savedValue = ev.target.value;
    }
    });

    // When the user clicks off the selection box, the data is sent to the server
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