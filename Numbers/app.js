const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const REQUEST_TIMEOUT = 500; // 500 milliseconds

// Function to fetch data from URL and handle timeouts
async function fetchDataFromURL(url) {
    try {
        const response = await axios.get(url, { timeout: REQUEST_TIMEOUT });
        return response.data.numbers;
    } catch (error) {
        // If the request times out or encounters an error, we return an empty array
        return [];
    }
}

// API endpoint to get numbers from multiple URLs
app.get('/numbers', async function (req, res) {
    try {
        const urls = req.query.url;

        if (!urls || !Array.isArray(urls)) {
            return res.status(400).json({ error: 'Invalid query parameters' });
        }

        const promises = urls.map((url) => fetchDataFromURL(url));
        const numbersFromURLs = await Promise.all(promises);

        // Combine numbers from all URLs and remove duplicates
        const allNumbers = Array.from(new Set(numbersFromURLs.flat()));

        // Sort the numbers in ascending order
        allNumbers.sort((a, b) => a - b);

        res.json({ numbers: allNumbers });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, function () {
    console.log('Server is running on port ' + PORT);
});
