/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git} from '../types';

export const setBranchToCommit = async (git: Git, branchName: string, hash: string) => {
  const currentBranch = await git(`rev-parse`, `--abbrev-ref`, `HEAD`);

  if (currentBranch === branchName) {
    await git(`reset`, `--hard`, hash);
  } else {
    await git(`branch`, `-f`, branchName, hash);
  }
};
