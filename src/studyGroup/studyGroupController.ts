import { Request, Response } from "express";
import { studyGroup } from "./studyGroupModel.js";
import { User } from "../auth/userModel.js";

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

export const editGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.query;
    const group = await studyGroup.findOneAndUpdate(
      { _id: groupId, created_by: (req as any).user.userId },
      req.body,
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const group = await studyGroup.findOne({
      _id: req.query.id,
    });
    return res.status(200).json({
      success: true,
      message: "Group found successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    if (
      (req as any).user.role !== "admin" &&
      (req as any).user.role !== "teacher"
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const group = await studyGroup.findByIdAndDelete({
      _id: (req as any).query.id,
      created_by: (req as any).user.userId,
    });
    return res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

export const myGroups = async (req: Request, res: Response) => {
  try {
    const groups = await studyGroup.find({
      created_by: (req as any).user.userId,
    });

    if (!groups) {
      return res.status(404).json({
        success: false,
        message: "No groups found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Groups fetched successfully",
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};
