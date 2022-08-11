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
        { id: 'description', name: 'Description','attributes': editableCellAttributes },
        { id: 'amount', name: 'Amount' },
        { id: 'category', name: 'Category', 'attributes': editableCellAttributes },
        ],
        server: {
            url: '/api/data',
            then: results => results.data,
        },
        search: true,
        sort: true,
        pagination: true,
    }).render(tableDiv);

    
    // https://blog.miguelgrinberg.com/post/beautiful-flask-tables-part-2

    let savedValue;

        tableDiv.addEventListener('focusin', ev => {
        if (ev.target.tagName === 'TD') {
            savedValue = ev.target.textContent;
        }
        });

        tableDiv.addEventListener('focusout', ev => {
        if (ev.target.tagName === 'TD') {
            if (savedValue !== ev.target.textContent) {
            fetch('/api/data', {
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

