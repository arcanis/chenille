/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
exports.clearBranches = async (git, ...branches) => {
  await git(`checkout`, `--detach`);

  for (const branch of branches) {
    let branchExists = true;
    try {
      await git(`rev-parse`, `--verify`, branch);
    } catch (err) {
      branchExists = false;
    }

    if (branchExists) {
      await git(`branch`, `-D`, branch);
    }
  }
};
