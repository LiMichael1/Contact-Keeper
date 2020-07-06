// Library to communicate with database
const mongoose = require('mongoose');
// Gets default.json in config file
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected....');
  } catch (err) {
    console.err(err.message);
    process.exit(1); //Exit for Failure
  }
};

module.exports = connectDB;
