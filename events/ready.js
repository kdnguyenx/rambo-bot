import { Events } from 'discord.js';
import logger from '../utils/logger.js';
import { fetchDiscordUsers } from '../utils/helper.js';
import { euroDailyMorningJob } from '../utils/football.js';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client) {
  logger.info(`Ready! Logged in as ${client.user.tag}`);

  logger.info('Starting Euro daily morning check job');
  euroDailyMorningJob(client);

  logger.info('Pre-fetch audited users');
  client.cachedUsers = await fetchDiscordUsers(client);
}
