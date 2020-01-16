/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import got from 'got';

import {Git, Pr} from '../types';

export const sendMergeNotifications = async (git: Git, prs: Pr[]) => {
  const label = git.config.labels.merged;
  if (typeof label === `undefined`)
    return;

  const repoString = process.env.GITHUB_REPOSITORY;
  if (typeof repoString === `undefined`)
    throw new Error(`Assertion failed: Missing GITHUB_REPOSITORY environment variable`);
  
  const repoToken = process.env.GITHUB_TOKEN;
  if (typeof repoToken === `undefined`)
    throw new Error(`Assertion failed: Missing GITHUB_TOKEN environment variable`);

  const [owner, name] = repoString.split(/\//);

  for (const pr of prs) {
    await got.post(`https://api.github.com/repos/${owner}/${name}/issues/${pr.number}/labels`, {
      json: true,
      headers: {
        Authorization: `token ${repoToken}`,
      },
      body: {
        labels: [label],
      },
    });
  }
};
