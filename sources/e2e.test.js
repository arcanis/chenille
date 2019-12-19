const cli = require(`./cli`);

const {getAllQueuedPullRequests} = require(`./git/getAllQueuedPullRequests`);

describe(`E2E Tests`, () => {
  beforeEach(() => {
    delete global.__mocks__;
  });

  it(
    `should send a PR to the merge queue when requested`,
    makeTemporaryEnv(`features-in-progress`, async ({path, git, context}) => {
      await git(`push`, `origin`, `feature1:pull/1/head`);

      await cli.run([`dispatch`, `comment`, `to`, `1`, `--title=Feature 1`, `--body=/chenille`], context);

      await expect(getAllQueuedPullRequests(git, `master`)).resolves.toEqual([
      ]);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 1, title: 'Feature 1', hash: expect.any(String)},
      ]);
    }),
  );

  it(
    `shouldn't send a PR to master if the status check isn't finished`,
    makeTemporaryEnv(`features-in-progress`, async ({path, git, context}) => {
      await git(`push`, `origin`, `feature1:pull/1/head`);
      await cli.run([`dispatch`, `comment`, `to`, `1`, `--title=Feature 1`, `--body=/chenille`], context);

      global.__mocks__ = {
        status: new Map([
          [1, new Map([
            [`my-status`, null],
          ])],
        ]),
      };

      await cli.run([`sync`, `against`, `queue`], context);

      await expect(getAllQueuedPullRequests(git, `master`)).resolves.toEqual([
      ]);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
        {number: 1, title: 'Feature 1', hash: expect.any(String)},
      ]);
    }),
  );

  it(
    `should send a PR to master if the status check is green`,
    makeTemporaryEnv(`features-in-progress`, async ({path, git, context}) => {
      await git(`push`, `origin`, `feature1:pull/1/head`);
      await cli.run([`dispatch`, `comment`, `to`, `1`, `--title=Feature 1`, `--body=/chenille`], context);

      global.__mocks__ = {
        status: new Map([
          [1, new Map([
            [`my-status`, true],
          ])],
        ]),
      };

      await cli.run([`sync`, `against`, `queue`], context);

      await expect(getAllQueuedPullRequests(git, `master`)).resolves.toEqual([
        {number: 1, title: 'Feature 1', hash: expect.any(String)},
      ]);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
      ]);
    }),
  );

  it(
    `should eject a PR from the merge queue if the status check is red`,
    makeTemporaryEnv(`features-in-progress`, async ({path, git, context}) => {
      await git(`push`, `origin`, `feature1:pull/1/head`);
      await cli.run([`dispatch`, `comment`, `to`, `1`, `--title=Feature 1`, `--body=/chenille`], context);

      global.__mocks__ = {
        status: new Map([
          [1, new Map([
            [`my-status`, false],
          ])],
        ]),
      };

      await cli.run([`sync`, `against`, `queue`], context);

      await expect(getAllQueuedPullRequests(git, `master`)).resolves.toEqual([
      ]);

      await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
      ]);

      expect(global.__mocks__.notifications).toEqual([
        expect.objectContaining({
          number: 1,
          reason: `Test results are red`,
        }),
      ]);
    }),
  );

  for (const [label, status] of [[`red`, false], [`undecided`, null]]) {
    for (const [action, followupStatus] of [[`merge`, true], [`reject`, false]]) {
      it(
        `shouldn't ${action} PRs that follow a ${label} PR`,
        makeTemporaryEnv(`features-in-progress`, async ({path, git, context}) => {
          await git(`push`, `origin`, `feature1:pull/1/head`);
          await cli.run([`dispatch`, `comment`, `to`, `1`, `--title=Feature 1`, `--body=/chenille`], context);

          await git(`push`, `origin`, `feature2:pull/2/head`);
          await cli.run([`dispatch`, `comment`, `to`, `2`, `--title=Feature 2`, `--body=/chenille`], context);

          global.__mocks__ = {
            status: new Map([
              [1, new Map([
                [`my-status`, status],
              ])],
              [2, new Map([
                [`my-status`, followupStatus],
              ])],
            ]),
          };

          await cli.run([`sync`, `against`, `queue`], context);

          await expect(getAllQueuedPullRequests(git, `master`)).resolves.toEqual([
          ]);

          await expect(getAllQueuedPullRequests(git)).resolves.toEqual([
            ... status === null ? [{number: 1, title: 'Feature 1', hash: expect.any(String)}]: [],
            {number: 2, title: 'Feature 2', hash: expect.any(String)},
          ]);

          if (status !== null) {
            expect(global.__mocks__.notifications).toEqual([
              expect.objectContaining({
                number: 1,
                reason: `Test results are red`,
              }),
            ]);
          }
        }),
      );
    }
  }
});
