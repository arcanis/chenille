exports.pushToOrigin = async (git, ...args) => {
  const basicAuthToken = Buffer.from(`git:${process.env.GITHUB_TOKEN}`).toString(`base64`);
  const authHeader = `Authorization: basic ${basicAuthToken}`;

  await git(`-c`, `http.extraheader=${authHeader}`, `push`, `origin`, ...args);
};
