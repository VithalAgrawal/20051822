const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const accessCode = 'FKDLjg';


// Function to filter trains departing in the next 30 minutes
function filterTrainsByTime(trains) {
    const currentTime = new Date().getTime();
    const next30Minutes = currentTime + 30 * 60 * 1000;
    return trains.filter(function (train) {
        return new Date(train.departureTime).getTime() > next30Minutes;
    });
}

// Function to sort trains based on price, seat availability, and departure time
function sortTrains(trains) {
    trains.sort(function (a, b) {
        // Sort by price in ascending order
        const priceComparison = a.price - b.price;
        if (priceComparison !== 0) return priceComparison;

        // Sort by tickets in descending order
        const ticketsComparison = b.tickets - a.tickets;
        if (ticketsComparison !== 0) return ticketsComparison;

        // Sort by departure time in descending order (considering delays)
        return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
    });
}

// Function to fetch train data from John Doe Railways API
async function fetchTrainData() {
    try {
        const response = await axios.get(apiEndpoint, {
            headers: {
                companyName: 'Central Railways',
                ownerName: 'John Doe',
                rollNo: '20051822',
                ownerEmail: '20051822@kiit.ac.in',
                accessCode: 'FKDLjg',
            },
        });
        console.log(response);
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch train data from John Doe Railways API.');
    }
}


app.post('/train/register', async function (req, res) {
    try {
        const response = await axios.post('http://20.244.56.144/train/register', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch train data from John Doe Railways API.');
    }
});

// API endpoint to get train schedules with seat availability and pricing
app.get('/trains', async function (req, res) {
    try {
        // Fetch train data from John Doe Railways API
        const trainData = await fetchTrainData();

        // Filter out trains departing in the next 30 minutes
        const filteredTrains = filterTrainsByTime(trainData);

        // Sort trains based on price, seat availability, and departure time
        sortTrains(filteredTrains);

        // Return the sorted and filtered train data
        res.json(filteredTrains);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, function () {
    console.log('Server is running on port ' + PORT);
});
