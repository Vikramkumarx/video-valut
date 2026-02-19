const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, organization } = req.body;
        const user = new User({ name, email, password, role, organization });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).send({ user, token });
    } catch (e) {
        console.error('Registration Error:', e);
        res.status(400).send({
            message: e.message || 'Registration failed',
            details: e.name === 'MongooseServerSelectionError' ? 'Database connection failed' : e
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ error: 'Invalid login credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.send({ user, token });
    } catch (e) {
        console.error('Login Error:', e);
        res.status(400).send({
            message: e.message || 'Login failed',
            details: e.name === 'MongooseServerSelectionError' ? 'Database connection failed' : e
        });
    }
};

exports.getMe = async (req, res) => {
    res.send(req.user);
};
