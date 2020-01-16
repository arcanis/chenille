/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {npath} from '@yarnpkg/fslib';

import cli from '../cli';
import {BASE_CONFIGURATION} from '../getConfiguration';

import {driver} from './driver';
import {getEventFile} from './getEventFile';

const eventFile = getEventFile();

const repoWorkspace = process.env.GITHUB_WORKSPACE;
if (typeof repoWorkspace === `undefined`)
  throw new Error(`Assertion failed: Missing GITHUB_WORKSPACE environment variable`);

const context = {
  cwd: npath.toPortablePath(repoWorkspace),
  driver,
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
