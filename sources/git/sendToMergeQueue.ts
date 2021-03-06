/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git, Pr} from '../types';

export const sendToMergeQueue = async (git: Git, pr: Pr, hash: string) => {
  try {
    const authorName = await git(`log`, `-1`, `--pretty=format:'%an'`, hash);
    const authorEmail = await git(`log`, `-1`, `--pretty=format:'%ae'`, hash);

    const author = [
      `-c`, `user.name=${authorName}`,
      `-c`, `user.email=${authorEmail}`,
    ];

    await git(`checkout`, git.config.branches.mergeQueue);
    await git(...author, `merge`, `--squash`, hash);
    await git.prefixSquashMessage(`[#${pr.number}] ${pr.title}\n\nCloses: #${pr.number}\n\n`);
    await git(...author, `commit`, `--no-edit`, `--author`, `${authorName} <${authorEmail}>`);

    return [];
  } catch (error) {
    return [{
      ...pr,
      reason: `Merge into ${git.config.branches.master} failed (${error.message})`,
    }];
  }
};
