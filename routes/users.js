const router = require('express').Router();
const {User, validate} = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validObjectId');

//create user
router.post('/', async (req, res) => {
    const { error } = await validate(req.body);
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

//get all users
router.get('/', admin,  async (req, res) => {
    const users = await User.find().select('-password -__v');
    res.status(200).send(users);
}
);

//get user by id
router.get('/:id', [auth, validateObjectId], async (req, res) => {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
}
);

//update user by id
router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, { new: true }).select('-password -__v');
    res.status(200).send(user);
}
);

//delete user by id
router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send({user, message: 'User deleted successfully.'});
}
);
    

module.exports = router;