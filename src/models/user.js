const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const { Schema } = mongoose

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
}, {timestamps: true})

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

userSchema.methods.matchPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('users', userSchema)