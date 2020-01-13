/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);

describe(`getAllQueuedPullRequests`, () => {
  it(
    `should retrieve all pull requests in the merge queue`,
    makeTemporaryEnv(`outdated-master`, async ({path, git}) => {
      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 1, title: 'Feature 1', hash: expect.any(String)},
        {number: 2, title: 'Feature 2', hash: expect.any(String)},
        {number: 3, title: 'Feature 3', hash: expect.any(String)},
        {number: 4, title: 'Feature 4', hash: expect.any(String)},
        {number: 5, title: 'Feature 5', hash: expect.any(String)},
        {number: 6, title: 'Feature 6', hash: expect.any(String)},
      ]);
    }),
  );

  it(
    `should return an empty array if master is up-to-date`,
    makeTemporaryEnv(`synchronized-master`, async ({path, git}) => {
      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([]);
    }),
  );

  it(
    `shouldn't return PRs already in master`,
    makeTemporaryEnv(`partial-master`, async ({path, git}) => {
      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 4, title: 'Feature 4', hash: expect.any(String)},
        {number: 5, title: 'Feature 5', hash: expect.any(String)},
        {number: 6, title: 'Feature 6', hash: expect.any(String)},
      ]);
    }),
  );
});
