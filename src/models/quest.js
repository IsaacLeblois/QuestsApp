const mongoose = require('mongoose')
const { Schema } = mongoose

const questsSchema = new Schema({
    quest: { type: String, required: true, unique: true },
    topic: { type: String, required: true },
    ageR: { type: String, required: true },
})

module.exports = mongoose.model('quests', questsSchema)