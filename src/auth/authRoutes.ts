import { Router } from 'express';
import { loginAdmin, loginStudent, loginTeacher, registerAdmin, registerStudent, registerTeacher } from './authController.js';

const router = Router();

// User registration endpoint
router.post('/registerstudent', registerStudent);
router.post('/registerteacher', registerTeacher);
router.post('/registeradmin', registerAdmin);
router.post('/loginstudent', loginStudent);
router.post('/loginteacher', loginTeacher);
router.post('/loginadmin', loginAdmin);


export default router;