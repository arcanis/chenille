/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
const got = require(`got`);

exports.sendCancelNotifications = async (prs) => {
  const [owner, name] = process.env.GITHUB_REPOSITORY.split(/\//);

  for (const pr of prs) {
    await got.post(`https://api.github.com/repos/${owner}/${name}/issues/${pr.number}/comments`, {
      json: true,
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      body: {
        body: `Your PR got removed from the merge queue.\n\nReason: ${pr.reason}.`,
      },
    });
  }
};
