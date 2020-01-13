/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);
const {sendToMergeQueue} = require(`./sendToMergeQueue`);

describe(`sendToMergeQueue`, () => {
  it(
    `should merge a feature at the end of the merge queue`,
    makeTemporaryEnv(`features-in-progress`, async ({path, git}) => {
      await sendToMergeQueue(git, {number: 1, title: `Feature 1`}, `feature1`);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 1, title: 'Feature 1', hash: expect.any(String)},
      ]);
    }),
  );

  it(
    `should merge multiple features at the end of the merge queue`,
    makeTemporaryEnv(`features-in-progress`, async ({path, git}) => {
      await sendToMergeQueue(git, {number: 1, title: `Feature 1`}, `feature1`);
      await sendToMergeQueue(git, {number: 3, title: `Feature 3`}, `feature3`);
      await sendToMergeQueue(git, {number: 2, title: `Feature 2`}, `feature2`);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 1, title: 'Feature 1', hash: expect.any(String)},
        {number: 3, title: 'Feature 3', hash: expect.any(String)},
        {number: 2, title: 'Feature 2', hash: expect.any(String)},
      ]);
    }),
  );
});
