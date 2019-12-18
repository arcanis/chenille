// To be able to require our dependencies
require(`../../.pnp.js`).setup();

const {npath} = require(`@yarnpkg/fslib`);

const cli = require(`../cli`);
const {BASE_CONFIGURATION} = reauire(`../getConfiguration`);

const {getEventFile} = require(`./getEventFile`);

const eventFile = getEventFile();

const context = {
  cwd: npath.toPortablePath(process.env.GITHUB_WORKSPACE),
  driver: require(`./driver`),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
};

switch (process.env.GITHUB_EVENT_NAME) {
  case `issue_comment`: {
    if (eventFile.action === `created` && eventFile.issue.pull_request && eventFile.issue.state === `open`) {
      cli.runExit([`dispatch`, `comment`, `to`, String(eventFile.issue.number), `--title=${eventFile.issue.title}`, `--body=${eventFile.comment.body}`], context);
    }
  } break;

  case `pull_request`: {
    if (eventFile.action === `synchronize`) {
      cli.runExit([`cancel`, String(eventFile.number), `--title=${eventFile.pull_request.title}`], context);
    }
  } break;

  case `push`: {
    if (eventFile.ref === `refs/heads/${BASE_CONFIGURATION.branches.master}`) {
      cli.runExit([`sync`, `against`, `master`], context);
    }
  } break;

  case `schedule`: {
    cli.runExit([`sync`, `against`, `queue`], context);
  } break;
}
