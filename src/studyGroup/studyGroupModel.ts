import mongoose, { Schema } from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    student_id: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    professor_id: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    subject: {
      type: String,
      required: true,
    },

    max_Members: {
      type: Number,
      required: true,
    },

    prof_controlled: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const studyGroup = mongoose.model("studyGroup", studyGroupSchema);
