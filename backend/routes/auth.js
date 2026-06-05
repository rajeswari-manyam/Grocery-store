import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import { userAuth, adminAuth } from '../middleware/auth.js';

const router = Router();

router.post('/send-otp', ctrl.sendOtp);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/login', ctrl.login);
router.post('/register', ctrl.register);
router.post('/admin-login', ctrl.adminLogin);
router.get('/me', userAuth, ctrl.me);
router.get('/users', adminAuth, ctrl.listUsers);

export default router;
