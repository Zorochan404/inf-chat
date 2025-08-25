import { Request, Response } from "express";
import { studyGroup } from "./studyGroupModel.js";

export const addGroup = async (req: Request, res: Response) => {
  try {
    if (
      (req as any).user.role === "teacher" ||
      (req as any).user.role === "admin"
    ) {
      const newgroup = new studyGroup({
        ...req.body,
        created_by: (req as any).user.userId,
        professor_id: [(req as any).user.userId],
      });
      const newGroup = await newgroup.save();
      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: newGroup,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};
