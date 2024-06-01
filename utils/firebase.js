const logger = require('../utils/logger');
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
  ref.once('value', (snapshot) => {
    logger.info('Successfully create or update users: ');
    console.log(snapshot.val());
  });
};

module.exports = {
  syncDiscordUsers,
};
