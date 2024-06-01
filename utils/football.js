const logger = require('./logger');
const { readOnceEuroInfoByPath } = require('./firebase');
const { isOneDayAhead } = require('./helper');
const { CronJob } = require('cron');

const euroDailyMorningJob = () => {
  return CronJob.from({
    // cronTime: '0 12 15 * * *',
    cronTime: '15 * * * * *',
    onTick: async () => {
      try {
        const resp = await readOnceEuroInfoByPath('matches');
        const matches = resp.val().filter((match) => {
          const date = new Date(Date.parse(match.date));
          return isOneDayAhead(date);
        });
        console.log(matches);
      } catch (err) {
        logger.error(err);
      }
    },
    start: true,
    timeZone: 'utc'
  });
};

module.exports = {
  euroDailyMorningJob,
};
