// To be able to require our dependencies
require(`../../.pnp.js`).setup();

const cli = require(`../cli`);

const {getEventFile} = require(`./getEventFile`);

const eventFile = getEventFile();

const context = {
  driver: require(`./driver`),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
};

switch (process.env.GITHUB_EVENT_NAME) {
  case `issue_comment`: {
    if (eventFile.action === `created` && eventFile.issue.pull_request && eventFile.issue.state === `open`) {
      console.log(eventFile)
      cli.runExit([`dispatch`, `comment`, `to`, eventFile.issue.number, `--cwd=${process.env.GITHUB_WORKSPACE}`, `--title=${eventFile.issue.title}`, `--body=${eventFile.comment.body}`], context);
    }
  } break;

  case `pull_request`: {
    if (eventFile.action === `synchronize`) {
      cli.runExit([`cancel`, eventFile.number, `--cwd=${process.env.GITHUB_WORKSPACE}`, `--title=${eventFile.pull_request.title}`], context);
    }
  } break;

  case `push`: {
    if (eventFile.ref === `refs/heads/master`) {
      cli.runExit([`resync`, `--cwd=${process.env.GITHUB_WORKSPACE}`], context);
    }
  } break;

  case `status`: {
    cli.runExit([`dispatch`, `status`], context);
  } break;
}
