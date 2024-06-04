const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' }); //To include development env files

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB, {}).then(() => console.log('DB connection successful'));

///Reading File
const tours = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');

///Import data into database
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    console.log('Data Imported successfully!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

///Delete all data from database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);
