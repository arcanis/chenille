exports.pushToOrigin = async (git, ...args) => {
  await git(`push`, `-c`, `http.extraheader=Authorization: basic ${process.env.GITHUB_TOKEN}`, `origin`, ...args);
};
