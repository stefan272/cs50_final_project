// import { Grid, html } from "gridjs";

document.addEventListener("DOMContentLoaded", function(){
    const tableDiv = document.getElementById('table');

    const editableCellAttributes = (data, row, col) => {
        if (row) {
        return {contentEditable: 'true', 'data-element-id': row.cells[0].data};
        }
        else {
        return {};
        }
    };

    new gridjs.Grid({
        columns: [
        { id: 'transaction_id', name: 'Transaction ID', 'hidden': true},
        { id: 'date', name: 'Date' },
        { id: 'description', name: 'Description' },
        { id: 'amount', name: 'Amount', formatter: (cell) => `£${cell}` },
        { id: 'category', name: 'Category', 'attributes': editableCellAttributes },
        {
            name: 'Actions',
            formatter: (cell, row) => {
              return gridjs.h('button', {
                className: 'py-2 mb-4 px-4 border rounded-md text-white bg-blue-600',
                onClick: () => fetch('/history/delete', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: row.cells[0].data
                    })
                })
              }, 'Remove');
            }
        },
        
        ],
        server: {
            url: '/api/data',
            then: results => results
        },
        search: true,
        sort: true,
        pagination: {
            limit: 10
        },
        fixedHeader: true,
        // height: '400px'
    }).render(tableDiv);

    
    // https://blog.miguelgrinberg.com/post/beautiful-flask-tables-part-2

    let savedValue;

        tableDiv.addEventListener('focusin', ev => {
        if (ev.target.tagName === 'TD') {
            savedValue = ev.target.textContent;
            console.log(savedValue);
        }
        });

        tableDiv.addEventListener('focusout', ev => {
        if (ev.target.tagName === 'TD') {
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

        tableDiv.addEventListener('keydown', ev => {
        if (ev.target.tagName === 'TD') {
            savedValue = ev.target.textContent;
            console.log(savedValue);
            if (ev.key === 'Escape') {
                ev.target.textContent = savedValue;
                ev.target.blur();
            }
            else if (ev.key === 'Enter') {
                ev.preventDefault();
                ev.target.blur();
            }
        }
        });
});