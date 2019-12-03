exports.pushToOrigin = async (git, ...args) => {
  await git(`-c`, `http.extraheader=Authorization: basic ${process.env.GITHUB_TOKEN}`, `push`, `origin`, ...args);
};
