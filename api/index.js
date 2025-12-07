const express = require('express');
const app = express();

// Your middleware and routes here
app.use(express.json());
app.get('/api/test', (req, res) => {
    res.json({ message: 'API working!' });
});

// Only listen if NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;