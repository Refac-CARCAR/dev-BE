require("dotenv").config();
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const path = require("path");

const ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
  accessKeyId: ID,
  secretAccessKey: SECRET,
  region: "ap-northeast-2",
});

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp"];

const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null);
    },
    acl: "public-read-write",
    key: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase(); // 파일의 확장자를 추출합니다.
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error("잘못된 확장자입니다."));
      }
      callback(null, `${Date.now()}_${file.originalname}`);
    }
  })
});

module.exports = { imageUploader };
