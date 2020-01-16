/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import yaml from 'js-yaml';

import {Configuration, Git} from './types';

export const BASE_CONFIGURATION = {
  branches: {
    master: process.env.INPUT_MASTER || `master`,
    mergeQueue: process.env.INPUT_MERGEQUEUE || `merge-queue`,
  },
};

export async function getConfiguration(git: Git): Promise<Configuration> {
  let configFile: string | undefined;
  try {
    configFile = await git(`show`, `${exports.BASE_CONFIGURATION.branches.master}:chenille.yml`);
  } catch {}

  const userConfiguration = typeof configFile !== `undefined`
    ? yaml.safeLoad(configFile)
    : {};

  return {
    labels: {},
    ...userConfiguration,
    ...exports.BASE_CONFIGURATION,
  };
}
