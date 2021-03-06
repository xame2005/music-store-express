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
    likedSongs: { type: Array, default: [] },
    playlist: { type: Array, default: []  },
    boughtSongs: { type: Array, default: []  },
    isAdmin: { type: Boolean, default: false },
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
        likedSongs: Joi.array().default([]),
        playlist: Joi.array().default([]),
        boughtSongs: Joi.array().default([]),
        isAdmin: Joi.boolean(),
    });
    return schema.validate(user);
}
    

const User = mongoose.model('user', userSchema);

module.exports = { User, validate };