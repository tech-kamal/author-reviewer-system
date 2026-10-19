import multer from "multer";
import path from "path";
import fs from "fs";

// ============================================
// Upload directory
// ============================================

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "reviews"
);

// ============================================
// Create directory if it does not exist
// ============================================

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ============================================
// Storage
// ============================================

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    cb
  ) => {
    cb(null, uploadDirectory);
  },

  filename: (
    req,
    file,
    cb
  ) => {
    const extension =
      path.extname(file.originalname);

    const uniqueName =
      `review-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

// ============================================
// Allowed file types
// ============================================

const allowedMimeTypes = [
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ============================================
// File filter
// ============================================

const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOC, and DOCX files are allowed."
      )
    );
  }
};

// ============================================
// Multer upload
// ============================================

export const reviewUpload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});