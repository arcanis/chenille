/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);
const {removeFromMergeQueue} = require(`./removeFromMergeQueue`);

describe(`removeFromMergeQueue`, () => {
  it(
    `should pop a pull request from the end of the queue`,
    makeTemporaryEnv(`outdated-master`, async ({path, git}) => {
      await removeFromMergeQueue(git, 6);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 1, title: 'Feature 1', hash: expect.any(String)},
        {number: 2, title: 'Feature 2', hash: expect.any(String)},
        {number: 3, title: 'Feature 3', hash: expect.any(String)},
        {number: 4, title: 'Feature 4', hash: expect.any(String)},
        {number: 5, title: 'Feature 5', hash: expect.any(String)},
      ]);
    }),
  );

  it(
    `should extract a pull request out of the queue`,
    makeTemporaryEnv(`outdated-master`, async ({path, git}) => {
      await removeFromMergeQueue(git, 3);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 1, title: 'Feature 1', hash: expect.any(String)},
        {number: 2, title: 'Feature 2', hash: expect.any(String)},
        {number: 4, title: 'Feature 4', hash: expect.any(String)},
        {number: 5, title: 'Feature 5', hash: expect.any(String)},
        {number: 6, title: 'Feature 6', hash: expect.any(String)},
      ]);
    }),
  );

  it(
    `should preserve the hashes as much as possible`,
    makeTemporaryEnv(`outdated-master`, async ({path, git}) => {
      const before = await getAllQueuedPullRequests(git);
      await removeFromMergeQueue(git, 3);
      const after = await getAllQueuedPullRequests(git);

      expect(before.slice(0, 2)).toEqual(after.slice(0, 2));
    }),
  );

  it(
    `should shift a pull request at the start of the queue`,
    makeTemporaryEnv(`outdated-master`, async ({path, git}) => {
      console.log(await getAllQueuedPullRequests(git));
      await removeFromMergeQueue(git, 1);
      console.log(await getAllQueuedPullRequests(git));

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 2, title: 'Feature 2', hash: expect.any(String)},
        {number: 3, title: 'Feature 3', hash: expect.any(String)},
        {number: 4, title: 'Feature 4', hash: expect.any(String)},
        {number: 5, title: 'Feature 5', hash: expect.any(String)},
        {number: 6, title: 'Feature 6', hash: expect.any(String)},
      ]);
    }),
  );

  it(
    `shouldn't allow removing a pull request already in master`,
    makeTemporaryEnv(`partial-master`, async ({path, git}) => {
      const initial = await getAllQueuedPullRequests(git);
      removeFromMergeQueue(git, 3);
      const after = await getAllQueuedPullRequests(git);

      expect(after).toEqual(initial);
    }),
  );
});
