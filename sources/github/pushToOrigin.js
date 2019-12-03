exports.pushToOrigin = async (git, ...args) => {
  await git(`-c`, `http.extraheader=Authorization: token ${process.env.GITHUB_TOKEN}`, `push`, `origin`, ...args);
};
