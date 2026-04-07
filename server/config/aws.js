/**
 * config/aws.js — AWS SDK v3 client factories
 */
const { S3Client }   = require('@aws-sdk/client-s3');
const { SESClient }  = require('@aws-sdk/client-ses');

const awsConfig = {
  region:      process.env.AWS_REGION          || 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID     || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const s3Client  = new S3Client(awsConfig);
const sesClient = new SESClient(awsConfig);

const S3_BUCKET      = process.env.AWS_S3_BUCKET       || 'student-marks-portal-files';
const SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL   || 'noreply@portal.edu';
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL  || '';

module.exports = { s3Client, sesClient, S3_BUCKET, SES_FROM_EMAIL, CLOUDFRONT_URL };
