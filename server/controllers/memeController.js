const connection = require('../config/db');

// Fungsi untuk mengunggah meme
module.exports.uploadMeme = async (req, res) => {
    try {
        const { title, img_url } = req.body;

        if (!img_url) {
            return res.status(400).json({ msg: 'Image URL is required' });
        }

        // Mendapatkan user ID dari session
        const userId = req.session.userId;

        // Query untuk menyimpan meme ke database
        const query = 'INSERT INTO meme_post (user_id, title, img_url, created_at) VALUES (?, ?, ?, NOW())';
        await connection.promise().query(query, [userId, title || null, img_url]);

        res.status(201).json({ msg: 'Meme uploaded successfully!' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Failed to upload meme.' });
    }
};

module.exports.getAllMemes = async (req, res) => {
    try {
        const query = `
            SELECT m.meme_id, m.title, m.img_url, m.created_at, u.username 
            FROM meme_post m
            JOIN users u ON m.user_id = u.user_id
            ORDER BY m.created_at DESC
        `;
        const [results] = await connection.promise().query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Failed to fetch memes.' });
    }
};

// Like meme
module.exports.likeMeme = async (req, res) => {
    try {
        const { meme_id } = req.body;
        const user_id = req.session.userId;

        if (!user_id) {
            return res.status(401).json({ msg: 'Unauthorized. Please login first.' })
        }

        const query = 'INSERT INTO suka (meme_id, user_id) VALUE (?, ?)';
        await connection.promise().query(query, [meme_id, user_id]);

        res.status(201).json({ msg: 'Meme liked successfully' })

    } catch (error) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to like meme' });
    }
}

// Unlike Meme 
module.exports.unlikeMeme = async (req, res) => {
    try {
        const { meme_id } = req.body;
        const user_id = req.session.userId;

        if (!user_id) {
            return res.status(401).json({ msg: 'Unauthorized. Please login first.' })
        }

        const query = 'DELETE FROM suka WHERE meme_id = ? AND user_id = ?';
        await connection.promise().query(query, [meme_id, user_id]);
        res.status(200).json({ msg: 'Meme unliked successfully' })
    } catch (error) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to unlike meme' });
    }
}

// Comment 
module.exports.addComment = async (req, res) => {
    try {
        const { meme_id, content } = req.body;
        const user_id = req.session.userId;

        if (!user_id) {
            return res.status(401).json({ msg: 'Unauthorized. Please login first.' });
        }

        if (!content || content.trim() === '') {
            return res.status(400).json({ msg: 'Comment content cannot be empty.' });
        }

        const query = 'INSERT INTO comment (meme_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())';
        await connection.promise().query(query, [meme_id, user_id, content]);

        res.status(201).json({ msg: 'Comment added successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Failed to add comment' });
    }
};

module.exports.getComments = async (req, res) => {
    try {
        const { meme_id } = req.params; // Mendapatkan ID meme dari parameter URL

        const query = `
            SELECT 
                comment.comment_id, 
                comment.content, 
                comment.created_at, 
                users.username 
            FROM comment 
            INNER JOIN users ON comment.user_id = users.user_id 
            WHERE comment.meme_id = ?
            ORDER BY comment.created_at DESC
        `;
        const [comments] = await connection.promise().query(query, [meme_id]);

        res.status(200).json(comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Failed to retrieve comments' });
    }
};

// Menghapus komentar
module.exports.deleteComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const user_id = req.session.userId; // Ambil ID user yang sedang login

        if (!user_id) {
            return res.status(401).json({ msg: "Unauthorized. Please login first." });
        }

        // Cek apakah komentar itu milik user yang sedang login
        const queryCheckOwner = 'SELECT user_id FROM comment WHERE comment_id = ?';
        const [result] = await connection.promise().query(queryCheckOwner, [comment_id]);

        if (result.length === 0) {
            return res.status(404).json({ msg: "Comment not found." });
        }

        const commentOwnerId = result[0].user_id;

        if (commentOwnerId !== user_id) {
            return res.status(403).json({ msg: "You do not have permission to delete this comment." });
        }

        // Jika userId cocok, hapus komentar
        const queryDelete = 'DELETE FROM comment WHERE comment_id = ?';
        await connection.promise().query(queryDelete, [comment_id]);

        res.status(200).json({ msg: "Comment deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Failed to delete comment" });
    }
};
