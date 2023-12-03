

window.onload = function () {
    const itemsPerPage = 10;
    let currentPage = 1;
    var data = [];
    var selectedRows = []; // Array to store selected rows

    const fetchData = async () => {
        try {
            const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
            data = await response.json();

            createRowForTable(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const createRowForTable = function (rowData) {
        // Check if data.records is an array before using forEach
        if (Array.isArray(rowData)) {
            const tbody = document.getElementById("data1");
            const paginationContainer = document.getElementById("pagination");
            const firstBtn = document.getElementById("firstBtn");
            const prevBtn = document.getElementById("prevBtn");
            const nextBtn = document.getElementById("nextBtn");
            const lastBtn = document.getElementById("lastBtn");
            const deleteBtn = document.getElementById("deleteBtn");
            const selectedRowsCountLabel = document.getElementById("selectedRowsCount");

            // Clear existing content
            tbody.innerHTML = "";
            paginationContainer.innerHTML = "";

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentData = rowData.slice(startIndex, endIndex);

            // Iterate over records and create table rows with checkboxes
            currentData.forEach((x, index) => {
                const row = tbody.insertRow();
                const cell0 = row.insertCell(0);
                const cell1 = row.insertCell(1);
                const cell2 = row.insertCell(2);
                const cell3 = row.insertCell(3);
                const cell4 = row.insertCell(4);

                // Add a checkbox to the first cell
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.dataset.index = startIndex + index; // Save the original index
                cell0.appendChild(checkbox);

                cell1.innerHTML = x.name;
                cell2.innerHTML = x.email;
                cell3.innerHTML = x.role;

                const deleteButton = document.createElement("button");
                deleteButton.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
                deleteButton.style.color = 'red';
                deleteButton.value = startIndex + index;

                deleteButton.addEventListener("click", function () {
                    const rowIndex = startIndex + index;
                    deleteSingleItem({ target: this }); // Pass an event-like object to simulate the event
                });


                const editButton = document.createElement("button");
                editButton.innerHTML = '<i class="fa fa-edit" aria-hidden="true"></i>';
                const nonBreakingSpace = document.createTextNode('\u00A0');
                const divSec = document.createElement("div");

                divSec.appendChild(editButton);
                divSec.appendChild(nonBreakingSpace);
                divSec.appendChild(deleteButton);

                cell4.appendChild(divSec);
            });

            // Create pagination links
            const totalPages = Math.ceil(rowData.length / itemsPerPage);
            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement("li");
                li.textContent = i;
                li.addEventListener("click", () => changePage(i));
                paginationContainer.appendChild(li);
            }

            // Enable/Disable navigation buttons based on the current page
            firstBtn.disabled = currentPage === 1;
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            lastBtn.disabled = currentPage === totalPages;

            // Add event listener to checkboxes
            const checkboxes = document.querySelectorAll('[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => handleCheckboxChange(checkbox));
            });

            // Add event listener to delete button
            deleteBtn.addEventListener('click', deleteSelectedRows);

            // Update the label indicating the number of selected rows
            selectedRowsCountLabel.textContent = `0 row(s) Selected`;
        } else {
            console.error('Data does not have the expected "records" array.');
        }

        const filterData = async () => {
            await new Promise(resolve => setTimeout(resolve, 300)); // Adjust the delay as needed
            const filterAlphabet = document.getElementById("searchInput").value.toLowerCase();
            const filteredData = data.filter(row => row.name.toLowerCase().startsWith(filterAlphabet));
            createRowForTable(filteredData);
        };


        // Add event listener to the search input
        document.getElementById("searchInput").addEventListener("input", filterData);
    };

    const changePage = (newPage) => {
        currentPage = newPage;
        fetchData();
    };

    const firstPage = () => {
        if (currentPage !== 1) {
            currentPage = 1;
            fetchData();
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            currentPage--;
            fetchData();
        }
    };

    const nextPage = () => {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            fetchData();
        }
    };

    const lastPage = () => {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            fetchData();
        }
    };

    const handleCheckboxChange = (checkbox) => {
        const dataIndex = parseInt(checkbox.dataset.index, 10);
        const isChecked = checkbox.checked;

        if (isChecked) {
            // Add the selected row to the array
            selectedRows.push(data[dataIndex]);
        } else {
            // Remove the unselected row from the array
            const indexToRemove = selectedRows.findIndex(row => row === data[dataIndex]);
            if (indexToRemove !== -1) {
                selectedRows.splice(indexToRemove, 1);
            }
        }

        // Update the label indicating the number of selected rows
        updateSelectedRowsCountLabel();
    };

    const deleteSelectedRows = () => {
        for (const selectedRow of selectedRows) {
            const indexToRemove = data.indexOf(selectedRow);
            if (indexToRemove !== -1) {
                // Remove the row from data.records
                data.splice(indexToRemove, 1);
            }
        }

        console.log('Deleting Selected Rows:', selectedRows);

        // Clear the selectedRows array after deletion
        selectedRows.length = 0;

        // Update the label indicating the number of selected rows
        updateSelectedRowsCountLabel();

        // Refetch data to update the table
        createRowForTable(data);
    };

    const deleteSingleItem = (evt) => {
        const rowIndex = parseInt(evt.target.closest('tr').querySelector('[type="checkbox"]').dataset.index, 10);
    
        if (!isNaN(rowIndex) && rowIndex >= 0 && rowIndex < data.length) {
            selectedRows = [data[rowIndex]];
            deleteSelectedRows();
        }
    };

    


    const updateSelectedRowsCountLabel = () => {
        // Update the label indicating the number of selected rows
        const selectedRowsCountLabel = document.getElementById("selectedRowsCount");
        const selectedCount = selectedRows.length;
        selectedRowsCountLabel.textContent = `${selectedCount} of ${data.length} row(s) selected`;
    };

    document.getElementById("firstBtn").addEventListener("click", firstPage);
    document.getElementById("prevBtn").addEventListener("click", prevPage);
    document.getElementById("nextBtn").addEventListener("click", nextPage);
    document.getElementById("lastBtn").addEventListener("click", lastPage);

    fetchData();
};

