import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import logger from './logger.js';

initializeApp({
  credential: applicationDefault(),
  databaseURL: process.env.FIREBASE_DB_URL,
});
const db = getDatabase();

export async function readOnceEuroInfoByPath(path) {
  return db.ref(`euro/${path}`).once('value');
}

export async function updateEuroMatch(match, content) {
  const ref = db.ref(`euro/matches/${match.id - 1}`);
  ref.update(content);
  logger.info(`Updated match ID [${match.id}] between ${match.home} and ${match.away}`);
}

export async function updateEuroMatchVote(matchId, userId, vote, messageId) {
  const ref = db.ref(`euro/votes/${matchId - 1}/${messageId}/${userId}`);
  ref.update({ vote: vote });
  logger.info(`Updated votes match ID [${matchId}] with message ID [${messageId}] of user ${userId}`);
}

export async function readOnceEuroMatchVotes(matchId, messageId) {
  const ref = db.ref(`euro/votes/${matchId - 1}/${messageId}`);
  return ref.once('value');
}

// ONLY RUN WHEN INIT DB
export async function resetEuroData() {
  const obj = await import('../data/euro2024.json');
  const ref = db.ref();
  const usersRef = ref.child('euro');

  usersRef.set(obj);
  ref.once('value', () => {
    logger.info('Successfully create or update Euro data');
  });
}
