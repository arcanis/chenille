/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git} from '../types';

export const isSynchronisedWithMaster = async (git: Git) => {
  return Number(await git(`rev-list`, `--count`, `${git.config.branches.mergeQueue}..${git.config.branches.master}`)) === 0;
};
