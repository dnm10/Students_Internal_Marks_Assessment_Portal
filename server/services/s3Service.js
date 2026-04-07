/**
 * services/s3Service.js — AWS S3 file upload/download helpers
 */
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Upload }    = require('@aws-sdk/lib-storage');
const { v4: uuid }  = require('uuid');
const path          = require('path');
const logger        = require('../utils/logger');
const { s3Client, S3_BUCKET, CLOUDFRONT_URL } = require('../config/aws');

/**
 * Upload a buffer/stream to S3.
 * @param {{ buffer: Buffer, originalname: string, mimetype: string, folder?: string }} opts
 * @returns {Promise<{ key: string, url: string }>}
 */
async function uploadToS3({ buffer, originalname, mimetype, folder = 'uploads' }) {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    logger.warn('AWS not configured — skipping S3 upload');
    return { key: null, url: null };
  }

  const ext  = path.extname(originalname).toLowerCase();
  const key  = `${folder}/${uuid()}${ext}`;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket:      S3_BUCKET,
        Key:         key,
        Body:        buffer,
        ContentType: mimetype,
      },
    });
    await upload.done();

    const url = CLOUDFRONT_URL
      ? `${CLOUDFRONT_URL}/${key}`
      : `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;

    logger.info(`Uploaded to S3: ${key}`);
    return { key, url };
  } catch (err) {
    logger.error('S3 upload failed:', err.message);
    throw err;
  }
}

/**
 * Generate a pre-signed GET URL for a private S3 object.
 */
async function getPresignedUrl(key, expiresInSeconds = 3600) {
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3Client, cmd, { expiresIn: expiresInSeconds });
}

/**
 * Delete an object from S3.
 */
async function deleteFromS3(key) {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    logger.info(`Deleted from S3: ${key}`);
  } catch (err) {
    logger.error('S3 delete failed:', err.message);
  }
}

module.exports = { uploadToS3, getPresignedUrl, deleteFromS3 };
