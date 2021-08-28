const mongoose = require('mongoose');

const serverDataSchema = new mongoose.Schema({
    productCategories: [],
})

const serverData = mongoose.model('serverData', serverDataSchema);

module.exports = serverData;