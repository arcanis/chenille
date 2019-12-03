const {UsageError} = require(`clipanion`);
const {readFileSync} = require(`fs`);

exports.getEventFile = () => {
  if (!process.env.GITHUB_EVENT_PATH)
    throw new UsageError(`Missing GitHub event file in the environment`);

  const content = readFileSync(process.env.GITHUB_EVENT_PATH, `utf8`);
  const data = JSON.parse(content);

  return data;
};
