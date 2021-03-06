const mongoose = require('mongoose');
const Joi = require('joi');

const ObjectId = mongoose.Schema.Types.ObjectId;

const playlistSchema = new mongoose.Schema({
    title: { type: String, required: true },
    name: { type: String },
    user: { type: ObjectId, ref:"user", required: true },
    desc: { type: String, allow:"" },
    songs: { type: Array, default: [] },
    img: { type: String},
});

const validate = (playlist) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(30).required(),
        name: Joi.string().min(3).max(30).allow(""),
        user: Joi.string().required(),
        desc: Joi.string().min(3).max(30).required().allow(''),
        songs: Joi.array().items(Joi.string()),
        img: Joi.string().allow(''),
    });
    return schema.validate(playlist);
}

const Playlist = mongoose.model('playlist', playlistSchema);

module.exports = { Playlist, validate };