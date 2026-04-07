/**
 * config/firebase.js — Firebase Admin SDK initialisation
 */
const admin  = require('firebase-admin');
const logger = require('../utils/logger');

let app;

function initFirebase() {
  if (admin.apps.length > 0) {
    app = admin.apps[0];
    return app;
  }

  const serviceAccount = {
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  // Only initialise if credentials are present
  if (!serviceAccount.projectId || serviceAccount.privateKey === '') {
    logger.warn('Firebase credentials missing — notifications will be skipped');
    return null;
  }

  app = admin.initializeApp({
    credential:   admin.credential.cert(serviceAccount),
    databaseURL:  process.env.FIREBASE_DATABASE_URL,
  });

  logger.info('Firebase Admin SDK initialised');
  return app;
}

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    logger.warn('Firebase not initialised');
    return null;
  }
  return admin;
}

function getFirebaseDB() {
  const adm = getFirebaseAdmin();
  if (!adm) return null;
  return adm.database();
}

module.exports = { initFirebase, getFirebaseAdmin, getFirebaseDB };
