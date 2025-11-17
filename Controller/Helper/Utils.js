const fs = require('fs');
const path = require('path');
const multer = require('multer');

exports.FormFileData = (folderName, field_name, file_name) => {
  const uploadPath = path.join(__dirname, '../../public', folderName);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, file_name + ext);
    },
  });

  const upload = multer({ storage }).single(field_name);

  return { success: true, upload, message: 'Upload setup ready' };
};


exports.FormFileDataMultiple = (storage_path, field_name, maxCount = 5) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDirectory = path.join(__dirname, '../../public', storage_path);
      cb(null, targetDirectory);
    },
    filename: (req, file, cb) => {
      // Add timestamp or random suffix to avoid collisions
      const timestamp = Date.now();
      const ext = file.originalname.split('.').pop();
      cb(null, `${file.fieldname}_${timestamp}.${ext}`);
    },
  });

  const targetDirectory = path.join(__dirname, 'public', storage_path);
  console.log(targetDirectory, field_name);

  // Use .array for multiple files
  const upload = multer({ storage: storage }).array(field_name, maxCount);
  return { success: true, upload: upload, message: 'Uploaded successfully' };
};