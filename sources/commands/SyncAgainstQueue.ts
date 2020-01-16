/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Command} from 'clipanion';

import {clearBranches} from '../git/clearBranches';
import {getAllQueuedPullRequests} from '../git/getAllQueuedPullRequests';
import {isSynchronisedWithMaster} from '../git/isSynchronisedWithMaster';
import {openRepository} from '../git/openRepository';
import {removeFromMergeQueue} from '../git/removeFromMergeQueue';
import {retryIfStale} from '../git/retryIfStale';
import {setBranchToCommit} from '../git/setBranchToCommit';

import {Context} from '../cli';
import {normalizeStatusMap} from '../normalizeStatusMap';
import {CanceledPr, Pr} from '../types';
import {validateStatusMap} from '../validateStatusMap';

class SyncAgainstQueue extends Command<Context> {
  async execute() {
    const git = await openRepository(this.context.cwd, {
      stdout: this.context.stdout,
    });

    const [merged, canceled] = await retryIfStale(async () => {
      let merged: Pr[] = [];
      let canceled: CanceledPr[] = [];

      await clearBranches(git, git.config.branches.master, git.config.branches.mergeQueue);

      this.context.stdout.write(`Fetching the head for master and the merge queue...\n`);
      await this.context.driver.fetchFromOrigin(git, `${git.config.branches.master}:${git.config.branches.master}`, `${git.config.branches.mergeQueue}:${git.config.branches.mergeQueue}`);

      // There is a chance that this workflow is executed right after
      // something has been pushed on master but before the
      // SyncAgainstMaster job has been triggered. Without this check
      // we would risk overriding master with the merge queue head,
      // forgetting any ninja-landed commit.

      if (!await isSynchronisedWithMaster(git)) {
        this.context.stdout.write(`Branch ${git.config.branches.master} is ahead of the merge queue; bailout\n`);
        return [merged, canceled];
      }

      const prs = await getAllQueuedPullRequests(git);
      if (prs.length === 0) {
        this.context.stdout.write(`No PRs queued; bailout\n`);
        return [merged, canceled];
      }

      const prsWithStatus = await this.context.driver.fetchCommitStatus(git, prs);

      for (const pr of prsWithStatus) {
        const originalStatusMap = pr.statusMap;

        pr.statusMap = normalizeStatusMap(git, pr.statusMap);
        pr.status = validateStatusMap(pr.statusMap);

        this.context.stdout.write(`#${pr.number} - ${pr.title} - ${pr.status}\n`);
        this.context.stdout.write(`${require(`util`).inspect(originalStatusMap)}\n`);
      }

      while (merged.length < prsWithStatus.length && prsWithStatus[merged.length].status!.ok === true)
        merged.push(prsWithStatus[merged.length]);

      // If the merge queue contains green commits, then we can move
      // them into master. Since we have previously checked that
      // master and merge-queue are in sync, we don't risk overriding
      // master by accident (because we'll push w/ force-with-lease).

      if (merged.length > 0) {
        const lastKnownGood = merged[merged.length - 1];

        this.context.stdout.write(`Synchronizing ${git.config.branches.master} to ${lastKnownGood.number}\n`);
        await setBranchToCommit(git, git.config.branches.master, lastKnownGood.hash);
      }

      // If a commit adjacent to a green commit is red, is probably
      // means something is wrong with it. We must remove it from
      // the queue in the hope that the following commits will be
      // green (all the tests will unfortunately have to run anew).

      if (merged.length < prsWithStatus.length) {
        const nextPr = prsWithStatus[merged.length];

        const nextStatus = nextPr.status;
        if (typeof nextStatus === `undefined`)
          throw new Error(`Assertion failed: The PR status should have been set`);

        if (nextStatus.ok === false) {
          const firstKnownBad = prsWithStatus[merged.length];

          this.context.stdout.write(`Removing ${firstKnownBad.number}\n`);
          canceled = await removeFromMergeQueue(git, firstKnownBad.number, {reason: `Test results are red for ${firstKnownBad.hash}:\n\n${nextStatus.message}`});
        }
      }

      if (merged.length > 0 || canceled.length > 0) {
        this.context.stdout.write(`Done - pushing the changes!\n`);
        await this.context.driver.pushToOrigin(git, `--atomic`, `--force-with-lease`, git.config.branches.master, git.config.branches.mergeQueue);
      }

      return [merged, canceled];
    });

    await this.context.driver.sendMergeNotifications(git, merged);
    await this.context.driver.sendCancelNotifications(git, canceled);
  }
}

SyncAgainstQueue.addPath(`sync`, `against`, `queue`);

module.exports = SyncAgainstQueue;
