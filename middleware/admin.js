const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('No token, authorization denied.');

    jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decoded) => {
        if (err) return res.status(401).send('Invalid token.');
        if(!decoded.isAdmin) return res.status(401).send('Not an admin. you don´t have access to this route.');
        req.user = decoded;
        next();
    }
    );
}