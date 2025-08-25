import { Request, Response } from "express";
import { User } from "../auth/userModel.js";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    console.log((req as any).user.role);
    if (
      (req as any).user.role !== "teacher" &&
      (req as any).user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const users = await User.find();
    const admin = users.filter((user) => user.role === "admin");
    const teacher = users.filter((user) => user.role === "teacher");
    const students = users.filter((user) => user.role === "student");
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        admin,
        teacher,
        students,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

export const getUserBySemester = async (req: Request, res: Response) => {
  try {
    console.log((req as any).user.role);
    if (
      (req as any).user.role !== "teacher" &&
      (req as any).user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const users = await User.find();
    const semesterStudents = users.filter(
      (user) => user.semester === req.query.semester
    );
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: semesterStudents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

export const getStudentByDepartment = async (req: Request, res: Response) => {
  try {
    console.log((req as any).user.role);
    if (
      (req as any).user.role !== "teacher" &&
      (req as any).user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const users = await User.find();
    const departmentStudents = users.filter((user) => {
      const userDepartment = user.department?.replace(/\s+/g, "").toLowerCase();
      const searchQuery = (req.query.department as string)
        ?.replace(/\s+/g, "")
        .toLowerCase();
      return userDepartment?.startsWith(searchQuery) && user.role === "student";
    });
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: departmentStudents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await User.find({ role: "teacher" });
    res.status(200).json({
      success: true,
      message: "Teachers fetched successfully",
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

export const myProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.userId);
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

export const getProfileById = async (req: Request, res: Response) => {
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

    const user = await User.findById(req.query.id);
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const editProfile = async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await User.findByIdAndUpdate(
      (req as any).user.userId,
      req.body,
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await User.findByIdAndDelete((req as any).user.userId);
    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};
