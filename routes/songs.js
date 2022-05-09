const router = require('express').Router();
const {User} = require('../models/user');
const {Song, validate} = require('../models/song');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validObjectId');

//create song
router.post('/', auth, async (req, res) => {
    const { error } = await validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const song = await Song(req.body).save();
    res.status(201).send({song, message: 'Song created successfully.'});
}
);

//get all songs
router.get('/', auth, async (req, res) => {
    const songs = await Song.find().select('-__v');
    res.status(200).send(songs);
}
);

//update song
router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const song = await Song.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, { new: true }).select('-__v');
    res.status(200).send({song, message: 'Song updated successfully.'});
}
);

//delete song
router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).send('The song with the given ID was not found.');
    res.send({song, message: 'Song deleted successfully.'});
}
);

//like song
router.put('/like/:id', [auth, validateObjectId], async (req, res) => {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).send('The song with the given ID was not found.');

    const user = await User.findById(req.user._id);
    const index = user.likedSongs.indexOf(song._id);
    if (index === -1) {
        user.likedSongs.push(song);
        await user.save();
        res.status(200).send({song, message: 'Song liked successfully.'});
    } else {
        user.likedSongs.splice(index, 1);
        await user.save();
        res.status(200).send({song, message: 'Song unliked successfully.'});
    }
}
);

//get liked songs
router.get('/liked', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -__v');
    res.status(200).send(user.likedSongs);
}
);

module.exports = router;