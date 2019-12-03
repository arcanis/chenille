// To be able to require our dependencies
require(`../../.pnp.js`);

const cli = require(`../cli`);

const {getEventFile} = require(`./getEventFile`);

const eventFile = getEventFile();

switch (process.env.GITHUB_EVENT_NAME) {
  case `issue_comment`: {
    if (eventFile.action === `created` && eventFile.issue.pull_request && eventFile.issue.state === `open`) {
      cli.runExit([`dispatch`, `comment`, `to`, eventFile.issue.number, `--cwd=${process.env.GITHUB_WORKSPACE}`, `--title=${eventFile.issue.title}`, `--body=${eventFile.issue.body}`]);
    }
  } break;

  case `pull_request`: {
    if (eventFile.action === `synchronize`) {
      cli.runExit([`cancel`, eventFile.number, `--cwd=${process.env.GITHUB_WORKSPACE}`, `--title=${eventFile.pull_request.title}`]);
    }
  } break;

  case `push`: {
    if (eventFile.ref === `refs/heads/master`) {
      cli.runExit([`resync`, `--cwd=${process.env.GITHUB_WORKSPACE}`]);
    }
  } break;

  case `status`: {
    cli.runExit([`dispatch`, `status`, `--driver=${require.resolve(`./fetchCommitStatus`)}`]);
  } break;
}
