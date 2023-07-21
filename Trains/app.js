const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const registrationData = {
    companyName: 'Central Railways',
    ownerName: 'John Doe',
    rollNo: '20051822',
    ownerEmail: '20051822@kiit.ac.in',
    accessCode: 'oJnNPG',
};

let accessToken = ''; // Global variable to store the access token

// Function to register the company with the John Doe Railway Server
async function registerCompany() {
    try {
        // // one time registration of the company
        // const response = await axios.post('http://20.244.56.144/train/register', registrationData);
        // const { companyName, clientID, clientSecret } = response.data;
        // console.log('Registration successful!');
        // console.log('Company Name:', companyName);
        // console.log('Client ID:', clientID);
        // console.log('Client Secret:', clientSecret);

        // Credentials of the company that has already been registered
        const credentials =
        {
            companyName: "Central Railways",
            clientID: "1c6ac0b7-d1ff-4d55-91e1-03adb38c07b1",
            clientSecret: "heqXXumwlaMkvqge"
        };

        // Obtain the authorization token after successful registration
        await obtainAuthToken(credentials.clientID, credentials.clientSecret);
    } catch (error) {
        console.error('Registration failed:', error.message);
    }
}

// Function to obtain the authorization token
async function obtainAuthToken(clientID, clientSecret) {
    try {
        const authData = {
            companyName: 'Central Railways', // Replace with your company name
            clientID,
            ownerName: 'John Doe', // Replace with the owner's name
            ownerEmail: '20051822@kiit.ac.in', // Replace with the owner's email
            rollNo: '20051822',
            clientSecret,
        };

        const response = await axios.post('http://20.244.56.144/train/auth', authData);
        tokenType = response.data.token_type;
        accessToken = response.data.access_token;
        expiresIn = response.data.expires_in;
        console.log('Authorization successful!');
    } catch (error) {
        console.error('Authorization failed:', error.message);
    }
}

// Function to fetch train data from John Doe Railways API with authorization
async function fetchTrainData() {
    try {
        const response = await axios.get('http://20.244.56.144/train/trains', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch train data from John Doe Railways API.');
    }
}

// Function to fetch details of a specific train from John Doe Railways API with authorization
async function fetchParticularTrainData(trainNumber) {
    try {
        const response = await axios.get(`http://20.244.56.144:80/train/trains/${trainNumber}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch details of train ${trainNumber} from John Doe Railways API.`);
    }
}

// Function to filter trains departing in the next 30 minutes
function filterTrainsByTime(trains) {
    const currentTime = (new Date().getHours() * 60 * 60 * 1000 + new Date().getMinutes() * 60 * 1000 + new Date().getSeconds() * 1000);
    // console.log(currentTime);
    const next30Minutes = currentTime + 30 * 60 * 1000;
    // console.log(next30Minutes);
    return trains.filter(function (train) {
        return ((train.departureTime.Hours * 60 * 60 * 1000) + (train.departureTime.Minutes * 60 * 1000) + (train.departureTime.Seconds * 1000)) > next30Minutes;
    });
}

// Function to sort trains based on price, seat availability, and departure time
function sortTrains(trains) {
    trains.sort(function (a, b) {
        // Sort by price in ascending order
        const priceComparison = a.price.sleeper - b.price.sleeper;
        if (priceComparison !== 0) return priceComparison;

        // Sort by tickets in descending order
        const ticketsComparison = b.seatsAvailable.sleeper - a.seatsAvailable.sleeper;
        if (ticketsComparison !== 0) return ticketsComparison;

        // Sort by departure time in descending order (considering delays)
        return ((b.departureTime.Hours * 60 * 60 * 1000) + (b.departureTime.Minutes * 60 * 1000) + (b.departureTime.Seconds * 1000) + (b.delayedBy * 60 * 100)) - ((a.departureTime.Hours * 60 * 60 * 1000) + (a.departureTime.Minutes * 60 * 1000) + (a.departureTime.Seconds * 1000) + (a.delayedBy * 60 * 100));
    });
}


// API endpoint to get all train schedules with seat availability and pricing
app.get('/trains', async (req, res) => {
    try {
        // Fetch all train data from John Doe Railways API
        const trainData = await fetchTrainData();
        // console.log(trainData);

        // Filter out trains departing in the next 30 minutes
        const filteredTrains = filterTrainsByTime(trainData);

        // Sort trains based on price, seat availability, and departure time
        sortTrains(filteredTrains);
        console.log(filteredTrains);

        // Return the sorted and filtered train data
        res.json(filteredTrains);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get details of a specific train
app.get('/trains/:trainNumber', async (req, res) => {
    try {
        const { trainNumber } = req.params;

        // Fetch details of the specific train from John Doe Railways API
        const trainDetails = await fetchParticularTrainData(trainNumber);

        res.json(trainDetails);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// To register the company and obtain the authorization token on server start
registerCompany();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
