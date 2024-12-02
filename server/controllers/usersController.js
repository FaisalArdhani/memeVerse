const bcrypt = require('bcrypt');
const connection = require('../config/db.js');

// Menampilkan data pengguna lain
module.exports.getUserProfile = async (req, res) => {
    try {
        const { id, username } = req.params;

        // Query untuk mendapatkan informasi pengguna berdasarkan user_id
        const userQuery = 'SELECT user_id, username, email FROM users WHERE user_id = ?';
        const [userResult] = await connection.promise().query(userQuery, [id, username]);

        if (userResult.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const memesQuery = 'SELECT meme_id, title, img_url, created_at FROM meme_post WHERE user_id = ?';
        const [memesResult] = await connection.promise().query(memesQuery, [id]);

        const userProfile = {
            ...userResult[0],
            memes: memesResult,
        };

        // Mengembalikan data profil pengguna beserta meme
        res.status(200).json(userProfile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Failed to retrieve user profile' });
    }
};


// Register
module.exports.register = async (req, res) => {
    try {
        const { username, email, password, confirm_password } = req.body;

        if (!password || !confirm_password) {
            return res.status(400).json({ msg: 'Password and confirm password are required' });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ msg: 'Password do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Query untuk insert data user
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        await connection.promise().query(query, [username, email, hashedPassword]);

        // Response jika berhasil
        res.status(201).json({ msg: 'Register successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: 'Failed to register' });
    }
};


// Login
module.exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await connection.promise().query(query, [username]);

        if (rows.length === 0) {
            return res.status(400).json({ msg: 'Username does not exist' });
        }

        const user = rows[0];
        const hashedPassword = user.password;

        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (isMatch) {
            req.session.userId = user.user_id;
            return res.status(200).json({ msg: 'Login successfully' });
        } else {
            return res.status(400).json({ msg: 'Wrong password' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: 'Failed to login' });
    }
};

// Logout
module.exports.logut = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ msg: 'Failed to logout' });
            }
            res.status(200).json({ msg: 'Logout successfully' });
        })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Failed to logout' });
    }
}