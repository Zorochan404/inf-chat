import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { addGroup, deleteGroup, editGroup, getGroupById, myGroups } from "./studyGroupController.js";

const router = Router();

router.post("/addgroup", authenticateToken, addGroup);
router.put("/updatedgroup", authenticateToken, editGroup);
router.get("/getgroup", authenticateToken, getGroupById);
router.delete("/deletegroup", authenticateToken, deleteGroup);
router.get("/mygroups", authenticateToken, myGroups)

export default router;  