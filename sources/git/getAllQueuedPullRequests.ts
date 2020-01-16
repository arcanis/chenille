/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git, Pr} from '../types';

export const getAllQueuedPullRequests = async (git: Git, branch: string = git.config.branches.mergeQueue) => {
  const prs: Pr[] = [];

  const history = branch !== git.config.branches.master
    ? `${git.config.branches.master}..${branch}`
    : branch;

  const output = await git(`log`, `--reverse`, `--grep=^\\[#[[:digit:]]\\+\\]`, history, `--pretty=format:%s%n%H`);
  if (output.length === 0)
    return prs;

  const lines = output.split(/\n/);
  for (let t = 0; t < lines.length; t += 2) {
    const oneline = lines[t];
    const hash = lines[t + 1];

    const match = oneline.match(/^\[#(\d+)\] (.*)/);
    if (match === null)
      throw new Error(`Assertion failed: Expected the commit title to contain a PR number (${oneline})`);

    // The first number in the title is the PR number
    const [, numberStr, title] = match;
    const number = parseInt(numberStr, 10);

    prs.push({number, title, hash});
  }

  return prs;
};
