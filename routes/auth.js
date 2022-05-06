const router = require('express').Router();
const {User, validateUser} = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('User not registered.');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password or email.');

    const token = user.generateAuthToken();
    res.status(200).send({ user, token });
}
);
module.exports = router;