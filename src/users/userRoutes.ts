import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import {
  deleteProfile,
  editProfile,
  getAllUsers,
  getProfileById,
  getStudentByDepartment,
  getTeachers,
  getUserBySemester,
  myProfile,
} from "./userController.js";

const router = Router();

router.get("/getallusers", authenticateToken, getAllUsers);
router.get("/getuserbysemester", authenticateToken, getUserBySemester);
router.get(
  "/getstudentbydepartment",
  authenticateToken,
  getStudentByDepartment
);
router.get("/getteachers", getTeachers);
router.get("/myprofile", authenticateToken, myProfile);
router.get("/getprofile", authenticateToken, getProfileById);
router.put("/editprofile", authenticateToken, editProfile);
router.delete("/deleteprofile", authenticateToken, deleteProfile);

export default router;
