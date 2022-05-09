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

//add song to playlist
router.put("/add-song", auth, async(req, res) => {
    const schema = Joi.object({
        playlistId: Joi.string().required(),
        songId: Joi.string().required(),
    });
    const { error } = await schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);
    if(!user._id.equals(playlist.user)) return res.status(401).send('You are not authorized to edit this playlist.');

    if(playlist.songs.indexOf(req.body.songId)===-1){
        playlist.songs.push(req.body.songId);
    };
    await playlist.save();
    res.status(200).send({message: "Song added successfully to playlist", playlist});
})

//remove song from playlist
router.put("/remove-song", auth, async(req, res) => {
    const schema = Joi.object({
        playlistId: Joi.string().required(),
        songId: Joi.string().required(),
    });
    const { error } = await schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);
    if(!user._id.equals(playlist.user)) return res.status(401).send('You are not authorized to edit this playlist.');

    const index = playlist.songs.indexOf(req.body.songId);
    playlist.songs.splice(index, 1);
    await playlist.save();
    res.status(200).send({message: "Song removed successfully from playlist", playlist});
})

//user favourite playlist
router.get("/favourite", auth, async (req, res) => {
    const user = await User.findById(req.user._id);
    const playlists = await Playlist.find({_id: {$in: user.favouritePlaylists}});
    res.status(200).send(playlists);
})

//get random playlist
router.get("/random", async (req, res) => {
    const playlists = await Playlist.aggregate([{$sample: {size: 9}}]);
    res.status(200).send(playlists);
}
);

//get playlist by id and songs
router.get("/:id", auth, validObjectId, async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);
    if(!playlist) return res.status(401).send('Playlist does not exist.');

    const songs = await Song.find({_id: {$in: playlist.songs}});
    res.status(200).send({playlist, songs});
}
);

//get all playlists
router.get("/", auth, async (req, res) => {
    const playlists = await Playlist.find({user: req.user._id});
    res.status(200).send(playlists);
}
);

//delete playlist
router.delete("/:id",[validObjectId, auth], async (req, res) => {
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.params.id);
    if(!user._id.equals(playlist.user)) return res.status(401).send('You are not authorized to delete this playlist.');

    const index = user.playlists.indexOf(playlist._id);
    user.playlists.splice(index, 1);
    await user.save();
    await playlist.remove();
    res.status(200).send({message: "Playlist deleted successfully"});
}
);

module.exports = router;