const router = require('express').Router();
const {Playlist, validate} = require('../models/playlist');
const {Song} = require('../models/song');
const {User} = require('../models/user');
const auth = require('../middleware/auth');
const validObjectId = require('../middleware/validObjectId');
const Joi = require('joi');

//create playlist
router.post('/', auth, async (req, res) => {
    const { error } = await validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.user._id);
    const playlist = await Playlist({...req.body, user: user._id}).save();
    user.playlists.push(playlist._id);
    await user.save();

    res.status(201).send(playlist);
}
);

//edit playlist by id
router.put('/edit/:id', auth, validObjectId, async (req, res) => {
    
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        description: Joi.string().min(3).max(30).allow(""),
        img: Joi.string().allow(""),
    });
    
    const { error } = await schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const playlist = await Playlist.findById(req.params.id);
    if(!playlist) return res.status(401).send('Playlist does not exist.');

    const user = await User.findById(req.user._id);
    if(!user._id.equals(playlist.user)) return res.status(401).send('You are not authorized to edit this playlist.');

    playlist.name = req.body.name;
    playlist.description = req.body.description;
    playlist.img = req.body.img;
    await playlist.save();
    res.send({message: "Playlist updated successfully", playlist});
}
);

module.exports = router;