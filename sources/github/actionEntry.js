/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
require(`../../.pnp.js`).setup();
require(`../setupDevEnv`);

const {npath} = require(`@yarnpkg/fslib`);

const {default: cli} = require(`../cli`);
const {BASE_CONFIGURATION} = require(`../getConfiguration`);

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
      cli.runExit([`cancel`, String(eventFile.number), `--reason=New commits have been dispatched`], context);
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
