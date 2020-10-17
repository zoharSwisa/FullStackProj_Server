const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/UsersDB', { useFindAndModify: false });

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'));  
db.once('open', () => {  
  console.log(`Connected to the UsersDB database`);
});

