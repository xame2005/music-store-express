const mongoose = require('mongoose');
const Joi = require('joi');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    img: { type: String, required: true },
    duration: { type: String, required: true },
    genre: { type: String, required: true },
});

const validate = (song) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(30).required(),
        artist: Joi.string().min(3).max(30).required(),
        album: Joi.string().min(3).max(30).required(),
        img: Joi.string().required(),
        duration: Joi.string().required(),
        genre: Joi.string().required(),
    });
    return schema.validate(song);
}

const Song = mongoose.model('song', songSchema);

module.exports = { Song, validate };