import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { addGroup } from "./studyGroupController.js";

const router = Router();

router.post("/addgroup", authenticateToken, addGroup);


export default router;