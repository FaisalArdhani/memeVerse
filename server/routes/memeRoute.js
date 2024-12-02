const express = require('express');
const router = express.Router();
const memeController = require('../controllers/memeController');

// Middleware untuk memastikan pengguna sudah login
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ msg: 'Unauthorized. Please login first.' });
    }
    next();
};

router.get('/protected-route', isAuthenticated, (req, res) => {
    res.json({ msg: 'You are authorized!' });
});

// Route Upload
router.post('/upload', isAuthenticated, memeController.uploadMeme); // --> Upload meme
router.get('/', memeController.getAllMemes); // --> Lihat semua meme

// Route Like
router.post('/like', memeController.likeMeme);        // --> Like meme
router.delete('/unlike/:like_id', memeController.unlikeMeme);    // --> Unlike meme

// Route comment
router.post('/comment', memeController.addComment);       // --> Tambah komentar
router.get('/comments/:meme_id', memeController.getComments); // --> Lihat komentar berdasarkan meme
router.delete('/comment/:comment_id', memeController.deleteComment); //--> Hapus komentar


module.exports = router;
