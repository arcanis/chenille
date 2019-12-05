exports.sendCancelNotifications = async (prs) => {
  const [owner, name] = process.env.GITHUB_REPOSITORY.split(/\//);

  for (const pr of prs) {
    await got.post(`https://api.github.com/v3/repos/${owner}/${name}/issues/${pr.number}/comments`, {
      json: true,
      headers: {
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: {
        body: `Your PR got removed from the merge queue. Reason: ${pr.reason}.`,
      },
    });
  }
};
