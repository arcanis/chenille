/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);
const {synchroniseWithMaster} = require(`./synchroniseWithMaster`);

describe(`synchroniseWithMaster`, () => {
  it(
    `should keep the merge queue intact when master is ahead`,
    makeTemporaryEnv(`partial-master`, async ({path, git}) => {
      await synchroniseWithMaster(git);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 4, title: 'Feature 4', hash: expect.any(String)},
        {number: 5, title: 'Feature 5', hash: expect.any(String)},
        {number: 6, title: 'Feature 6', hash: expect.any(String)},
      ]);
    }),
  );

  it(
    `should reset the hashes when master is ahead`,
    makeTemporaryEnv(`outdated-master`, async ({path, git}) => {
      const before = await getAllQueuedPullRequests(git);
      await git(`checkout`, `master`);
      await git(`-c`, `user.name=Example`, `-c`, `user.email=postmaster@example.org`, `commit`, `-m`, `Reset master`, `--allow-empty`, `--author=Example <postmaster@example.org>`);
      await synchroniseWithMaster(git);
      const after = await getAllQueuedPullRequests(git);

      expect(after).toEqual(before.map(({hash, ...fields}) => ({
        ...fields,
        hash: expect.not.stringMatching(hash),
      })));
    }),
  );

  it(
    `should preserve the hashes when master is up-to-date`,
    makeTemporaryEnv(`outdated-master`, async ({path, git}) => {
      const before = await getAllQueuedPullRequests(git);
      await synchroniseWithMaster(git);
      const after = await getAllQueuedPullRequests(git);

      expect(after).toEqual(before);
    }),
  );
});
