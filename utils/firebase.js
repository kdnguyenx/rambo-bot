import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import logger from './logger.js';
import { readFile } from 'fs/promises';

initializeApp({
  credential: applicationDefault(),
  databaseURL: process.env.FIREBASE_DB_URL,
});
const db = getDatabase();

// ONLY RUN WHEN INIT DB
export async function resetEuroData() {
  const euroData = JSON.parse(
    await readFile(
      new URL('../data/euro2024.json', import.meta.url)
    )
  );

  const ref = db.ref();
  const usersRef = ref.child('euro');

  usersRef.set(euroData);
  ref.once('value', () => {
    logger.info('Successfully create or update Euro data');
  });
}


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

export async function updatePlayerInfo(userId) {
  const ref = db.ref(`euro/players/${userId}`);
  const snapshot = await ref.once('value');
  if (snapshot.val() !== null) {
    return 'You are already registered';
  } else {
    await ref.set({
      points: 0,
      matches: 0,
    });
    logger.info(`User [${userId}] successfully set`);
    return 'Registered successfully';
  }
}
