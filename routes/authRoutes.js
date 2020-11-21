//  routes/authRouters.js

const { Router } = require('express');
const authController = require('../controllers/authController');
const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/info', requireAuth, authController.info_get);
router.post('/file/upload', requireAuth, fileController.fileUpload_post);
router.get('/file/list', requireAuth, fileController.filesList_get);
router.put('/file/update/:id', requireAuth, fileController.fileUpdate_put);
router.get('/file/:id', requireAuth, fileController.fileInfo_get);
router.delete('/file/delete/:id', requireAuth, fileController.fileDelete_delete);

module.exports = router;
