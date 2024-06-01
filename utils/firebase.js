const logger = require('./logger');
const { firebaseUrl, firebaseServiceAccountPath } = require('../config.json');
const admin = require('firebase-admin');
const { fetchDiscordUsers } = require('./helper');

const serviceAccount = require(firebaseServiceAccountPath);

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseUrl
});

const syncDiscordUsers = async (client) => {
  const members = await fetchDiscordUsers(client);

  const db = admin.database();
  const ref = db.ref();
  const usersRef = ref.child('users');

  usersRef.set(members);
  ref.once('value', (_) => {
    logger.info('Successfully create or update users');
    // console.log(snapshot.val());
  });
};

const readOnceEuroInfoByPath = async (path) => {
  const db = admin.database();
  const ref = db.ref(`euro/${path}`);
  return ref.once('value');
}

// ONLY RUN WHEN INIT DB
const resetEuroData = async () => {
  const obj = require('../data/euro2024.json')
  const db = admin.database();
  const ref = db.ref();
  const usersRef = ref.child('euro');

  usersRef.set(obj);
  ref.once('value', (_) => {
    logger.info('Successfully create or update Euro data');
  });
};

module.exports = {
  syncDiscordUsers,
  resetEuroData,
  readOnceEuroInfoByPath
};
