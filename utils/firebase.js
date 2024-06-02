const logger = require('./logger');
const { firebaseUrl, firebaseServiceAccountPath } = require('../config.json');
const admin = require('firebase-admin');
const { fetchDiscordUsers } = require('./helper');

const serviceAccount = require(firebaseServiceAccountPath);

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseUrl
});
const db = admin.database();

const syncDiscordUsers = async (client) => {
  const members = await fetchDiscordUsers(client);

  const ref = db.ref('users');
  ref.update(members, (_) => {
    logger.info('Successfully update users');
  });
};

const loadAllDiscordUsers = async () => {
  return db.ref('users').once('value');
}

const readOnceEuroInfoByPath = async (path) => {
  const ref = db.ref(`euro/${path}`);
  return ref.once('value');
}

const updateEuroMatch = async (match, content) => {
  const ref = db.ref(`euro/matches/${match.id - 1}`);
  ref.update(content);
  logger.info(`Updated match ID [${match.id}] between ${match.home} and ${match.away}`);
}

const updateEuroMatchVote = async (matchId, userId, vote, messageId) => {
  const ref = db.ref(`euro/votes/${matchId - 1}/${messageId}/${userId}`);
  ref.update({ vote: vote });
  logger.info(`Updated votes match ID [${matchId}] with message ID [${messageId}] of user ${userId}`);
}

const readOnceEuroMatchVotes = async (matchId, messageId) => {
  const ref = db.ref(`euro/votes/${matchId - 1}/${messageId}`);
  return ref.once('value');
}

// ONLY RUN WHEN INIT DB
const resetEuroData = async () => {
  const obj = require('../data/euro2024.json')
  const ref = db.ref();
  const usersRef = ref.child('euro');

  usersRef.set(obj);
  ref.once('value', (_) => {
    logger.info('Successfully create or update Euro data');
  });
};

module.exports = {
  syncDiscordUsers,
  loadAllDiscordUsers,
  resetEuroData,
  readOnceEuroInfoByPath,
  updateEuroMatch,
  updateEuroMatchVote,
  readOnceEuroMatchVotes
};
