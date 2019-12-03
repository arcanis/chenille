const {fetchCommitStatus} = require('./fetchCommitStatus');

const ifGitHubToken = process.env.GITHUB_TOKEN
  ? it
  : it.skip;

describe(`GitHub`, () => {
  describe(`fetchCommitStatus`, () => {
    ifGitHubToken(
      `should fetch status from GitHub (modern check API)`,
      makeTemporaryEnv(`clean-repo`, async ({git}) => {
        process.env.GITHUB_REPOSITORY = `yarnpkg/berry`;

        await expect(fetchCommitStatus(git, [{
          hash: `c6d14ba0c6c5a78713dbdf992c5bbcdfe41d763b`,
          title: `Transparent workspace resolution`,
          number: 608,
        }])).resolves.toEqual([{
          hash: `c6d14ba0c6c5a78713dbdf992c5bbcdfe41d763b`,
          title: `Transparent workspace resolution`,
          number: 608,
          statusMap: new Map([
            [`github/pages`, true],
            [`GitHub Pages / Page Build`, true],
            [`GitHub Actions / Testing chores`, true],
            [`GitHub Actions / ubuntu-latest w/ Node.js 10.x`, true],
            [`GitHub Actions / windows-latest w/ Node.js 10.x`, true],
            [`GitHub Actions / macos-latest w/ Node.js 10.x`, true],
            [`GitHub Actions / ubuntu-latest w/ Node.js 12.x`, true],
            [`GitHub Actions / windows-latest w/ Node.js 12.x`, true],
            [`GitHub Actions / macos-latest w/ Node.js 12.x`, true],
            [`GitHub Actions / ubuntu-latest w/ Node.js 13.x`, true],
            [`GitHub Actions / windows-latest w/ Node.js 13.x`, true],
            [`GitHub Actions / macos-latest w/ Node.js 13.x`, true],
            [`GitHub Actions / Validating Gatsby`, true],
            [`GitHub Actions / Validating ESLint`, true],
            [`GitHub Actions / Validating Husky`, true],
            [`GitHub Actions / Validating TypeScript`, true],
            [`GitHub Actions / Validating Create-React-App`, true],
            [`GitHub Actions / Validating Mocha`, true],
            [`GitHub Actions / Validating Next.js`, true],
            [`GitHub Actions / Validating Webpack`, true],
            [`GitHub Actions / Validating Jest`, true],
            [`GitHub Actions / Validating Prettier`, true],
            [`GitHub Actions / Running Sherlock`, false],
          ]),
        }]);
      }),
    );

    ifGitHubToken(
      `should fetch status from GitHub (older status API)`,
      makeTemporaryEnv(`clean-repo`, async ({git}) => {
        process.env.GITHUB_REPOSITORY = `yarnpkg/yarn`;

        await expect(fetchCommitStatus(git, [{
          hash: `98d51d88310eede3d6394a20d5a11dbb258cb54b`,
          title: `Prevents cache removal when running an install`,
          number: 7699,
        }])).resolves.toEqual([{
          hash: `98d51d88310eede3d6394a20d5a11dbb258cb54b`,
          title: `Prevents cache removal when running an install`,
          number: 7699,
          statusMap: new Map([
            [`Yarn Acceptance Tests`, true],
            [`buildsize`, true],
            [`ci/circleci: build`, true],
            [`ci/circleci: install`, true],
            [`ci/circleci: lint`, true],
            [`ci/circleci: test-e2e-ubuntu1204`, true],
            [`ci/circleci: test-e2e-ubuntu1404`, true],
            [`ci/circleci: test-e2e-ubuntu1604`, true],
            [`ci/circleci: test-linux-node4`, true],
            [`ci/circleci: test-linux-node6`, true],
            [`ci/circleci: test-linux-node8`, true],
            [`ci/circleci: test-linux-node10`, true],
            [`ci/circleci: test-linux-node12`, true],
            [`ci/circleci: test-linux-node13`, true],
            [`ci/circleci: test-macos-node6`, true],
            [`ci/circleci: test-macos-node8`, true],
            [`ci/circleci: test-macos-node10`, true],
            [`ci/circleci: test-pkg-tests-linux-node8`, true],
            [`ci/circleci: test-pkg-tests-linux-node10`, true],
            [`ci/circleci: test-pkg-tests-linux-node12`, true],
            [`ci/circleci: test-pkg-tests-linux-node13`, true],
            [`continuous-integration/appveyor/branch`, true],
          ]),
        }]);
      }),
    );
  });
});
