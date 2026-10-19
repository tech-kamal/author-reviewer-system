
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const uploadDir = path.join(
//   process.cwd(),
//   "uploads",
//   "papers"
// );

// console.log("UPLOAD DIRECTORY:", uploadDir);

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, {
//     recursive: true,
//   });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log("MULTER DESTINATION CALLED");
//     console.log("FILE RECEIVED:", file);

//     cb(null, uploadDir);
//   },

//   filename: function (req, file, cb) {
//     console.log("MULTER FILENAME CALLED");
//     console.log("ORIGINAL FILE:", file.originalname);

//     const uniqueName =
//       Date.now() +
//       "-" +
//       Math.round(Math.random() * 1e9) +
//       path.extname(file.originalname);

//     cb(null, uniqueName);
//   },
// });

// const fileFilter = (
//   req: Express.Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   console.log("MULTER FILE FILTER CALLED");
//   console.log("MIME TYPE:", file.mimetype);
//   console.log("FIELD NAME:", file.fieldname);

//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF files are allowed"));
//   }
// };

// export const uploadPaper = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024,
//   },
// });



import multer from "multer";
import path from "path";
import fs from "fs";

// ============================================
// Upload directory
// ============================================

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "papers"
);

console.log("UPLOAD DIRECTORY:", uploadDir);

// ============================================
// Create upload directory if it does not exist
// ============================================

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// ============================================
// Multer storage
// ============================================

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    cb
  ) => {
    console.log(
      "MULTER DESTINATION CALLED"
    );

    console.log(
      "FILE RECEIVED:",
      file.originalname
    );

    cb(null, uploadDir);
  },

  filename: (
    req,
    file,
    cb
  ) => {
    console.log(
      "MULTER FILENAME CALLED"
    );

    console.log(
      "ORIGINAL FILE:",
      file.originalname
    );

    const extension =
      path.extname(file.originalname);

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extension;

    cb(null, uniqueName);
  },
});

// ============================================
// PDF file filter
// ============================================

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log(
    "MULTER FILE FILTER CALLED"
  );

  console.log(
    "MIME TYPE:",
    file.mimetype
  );

  console.log(
    "FIELD NAME:",
    file.fieldname
  );

  // --------------------------------------------
  // Allow PDF only
  // --------------------------------------------

  if (
    file.mimetype ===
    "application/pdf"
  ) {
    cb(null, true);
    return;
  }

  // --------------------------------------------
  // Reject non-PDF files
  // --------------------------------------------

  cb(
    new Error(
      "Only PDF files are allowed"
    )
  );
};

// ============================================
// Multer upload configuration
// ============================================

export const uploadPaper = multer({
  storage,

  fileFilter,

  limits: {
    // Maximum file size: 10 MB
    fileSize: 10 * 1024 * 1024,
  },
});