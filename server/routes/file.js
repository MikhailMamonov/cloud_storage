const Router = require('express');
const router = new Router();
const authMiddleware = require('../middlewares/auth.middleware');
const fileController = require('../controllers/fileController');

router.post('', authMiddleware, fileController.createDir);
router.get('', authMiddleware, fileController.getFiles);
router.post('/upload', authMiddleware, fileController.uploadFile);
router.get('/download', authMiddleware, fileController.downloadFile);
router.get('/search', authMiddleware, fileController.searchFile);
router.delete('/', authMiddleware, fileController.deleteFile);

module.exports = router;
