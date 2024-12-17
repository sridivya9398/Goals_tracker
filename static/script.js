let chart; // Declare a variable to store the chart instance

// Function to fetch and display data in the table
async function fetchData() {
    try {
        const response = await fetch('/data', { method: 'GET' });
        if (response.ok) {
            const data = await response.json();
            const tableBody = document.getElementById('data-table-body');
            tableBody.innerHTML = ""; // Clear previous rows
            data.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.id}</td>
                    <td>${entry.user_id}</td>
                    <td>${entry.date}</td>
                    <td>${entry.type_of_data}</td>
                    <td>${entry.value}</td>
                    <td>
                        <button onclick="deleteRecord(${entry.id})">Delete</button>
                        <button onclick="editRecord(${entry.id}, '${entry.date}', '${entry.type_of_data}', ${entry.value})">Update</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            console.error("Failed to fetch data:", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Event listener for form submission
document.getElementById('data-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const value = document.getElementById('value').value;

    try {
        const response = await fetch('/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 1, date, type_of_data: type, value }),
        });

        if (response.ok) {
            alert("Data added successfully!");
            fetchData(); // Refresh table data
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error("Error submitting data:", error);
        alert("An error occurred while submitting the data.");
    }
});

// Function to delete a record
async function deleteRecord(id) {
    try {
        const response = await fetch(`/data/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Record deleted successfully!");
            fetchData(); // Refresh table data
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error("Error deleting record:", error);
        alert("An error occurred while deleting the record.");
    }
}

// Function to prefill the form for updating a record
function editRecord(id, date, type, value) {
    document.getElementById('date').value = date;
    document.getElementById('type').value = type;
    document.getElementById('value').value = value;

    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.textContent = "Update Record";

    // Add event listener to handle update
    submitButton.onclick = async (e) => {
        e.preventDefault();
        try {
            const updatedDate = document.getElementById('date').value;
            const updatedType = document.getElementById('type').value;
            const updatedValue = document.getElementById('value').value;

            const response = await fetch(`/data/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    date: updatedDate,
                    type_of_data: updatedType,
                    value: updatedValue,
                }),
            });

            if (response.ok) {
                alert("Record updated successfully!");
                fetchData(); // Refresh table data
                submitButton.textContent = "Submit";
                submitButton.onclick = null; // Reset the button behavior
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error("Error updating record:", error);
            alert("An error occurred while updating the record.");
        }
    };
}

// Fetch and display trends
async function fetchTrends(chartType = 'bar') {
    try {
        const response = await fetch('/trends/1'); // Replace '1' with dynamic user ID if needed
        if (!response.ok) throw new Error("Failed to fetch trends");

        const trends = await response.json();

        // Extract labels and data
        const labels = trends.map(t => Object.keys(t)[0]);
        const data = trends.map(t => Object.values(t)[0]);

        // Get the canvas element
        const ctx = document.getElementById('trendChart').getContext('2d');

        // Destroy the existing chart instance, if any
        if (chart) {
            chart.destroy();
        }

        // Create a new chart with a white background
        chart = new Chart(ctx, {
            type: chartType, // Dynamic chart type
            data: {
                labels,
                datasets: [{
                    label: 'Trends',
                    data,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                layout: {
                    padding: 20
                },
            },
            plugins: [{
                id: 'whiteBackground', // Custom plugin for a white background
                beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.fillStyle = 'white'; // Set white background
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            }]
        });
    } catch (error) {
        console.error("Error fetching trends:", error);
    }
}

// Add event listener for chart update button
document.getElementById('updateChart').addEventListener('click', () => {
    const selectedType = document.getElementById('chartType').value;
    fetchTrends(selectedType); // Fetch and render the chart with the selected type
});

// Fetch data and trends on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    fetchTrends();
});
