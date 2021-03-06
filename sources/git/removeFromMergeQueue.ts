/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git, CanceledPr} from '../types';

import {getAllQueuedPullRequests} from './getAllQueuedPullRequests';

export const removeFromMergeQueue = async (git: Git, removedPr: number, {reason = `n/a`}: {reason?: string} = {}) => {
  const canceled: CanceledPr[] = [];
  const prs = await getAllQueuedPullRequests(git);

  const killPoint = prs.findIndex(({number}) => number == removedPr);
  if (killPoint === -1)
    return canceled;

  canceled.push({
    ...prs[killPoint],
    reason,
  });

  const {hash} = prs[killPoint];

  await git(`checkout`, `-b`, `temp/${git.config.branches.mergeQueue}`, git.config.branches.mergeQueue);
  await git(`reset`, `--hard`, `${hash}^1`);

  for (const pr of prs.slice(killPoint + 1)) {
    const authorName = await git(`log`, `-1`, `--pretty=format:'%an'`, pr.hash);
    const authorEmail = await git(`log`, `-1`, `--pretty=format:'%ae'`, pr.hash);

    const author = [
      `-c`, `user.name=${authorName}`,
      `-c`, `user.email=${authorEmail}`,
    ];

    try {
      await git(...author, `cherry-pick`, pr.hash);
    } catch {
      await git(`cherry-pick`, `--abort`);
      canceled.push({
        ...pr,
        reason: `Rebase on top of its new parent (${await git(`rev-parse`, `--short`, `HEAD`)}) failed`,
      });
    }
  }

  await git(`checkout`, git.config.branches.mergeQueue);
  await git(`reset`, `--hard`, `temp/${git.config.branches.mergeQueue}`);
  await git(`branch`, `-D`, `temp/${git.config.branches.mergeQueue}`);

  return canceled;
};
