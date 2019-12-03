exports.pushToOrigin = async (git, ...args) => {
  await git(`push`, `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com:${process.env.GITHUB_REPOSITORY}.git`, ...args);
};
