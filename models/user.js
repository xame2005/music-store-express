const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    month: { type: String, required: true },
    day: { type: String, required: true },
    year: { type: String, required: true },
    likedSongs: { type: Array, required: true },
    playlist: { type: Array, required: true },
    boughtSongs: { type: Array, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, process.env.JWTPRIVATEKEY, {expiresIn: '7d'})
    return token;
}

const validate = (user) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: passwordComplexity().required(),
        month: Joi.string().required(),
        day: Joi.string().required(),
        year: Joi.string().required(),
        likedSongs: Joi.array().required(),
        playlist: Joi.array().required(),
        boughtSongs: Joi.array().required(),
        isAdmin: Joi.boolean().required(),
    });
    return schema.validate(user);
}
    

const User = mongoose.model('user', userSchema);

module.exports = { User, validate };