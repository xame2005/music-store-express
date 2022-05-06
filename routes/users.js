const router = require('express').Router();
const {User, validateUser} = require('../models/user');
const bcrypt = require('bcryptjs');

//create user
router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    const hash = await bcrypt.hash(req.body.password, salt);

    const newUser = await new User({
        ...req.body,
        password: hash
    }).save();

    newUser.password = undefined;
    newUser.__v = undefined;

    res.send(newUser);
}
);
module.exports = router;