const mongoose = require('mongoose');
const app = require('./app');
const seedDatabase = require('./seed/seedDatabase');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/Products';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    await seedDatabase();

    app.listen(8000, () => console.log('Server started on port 8000'));
  })
  .catch(err => console.error('Failed to connect to MongoDB:', err));
