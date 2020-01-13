/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
const yaml = require(`js-yaml`);

exports.BASE_CONFIGURATION = {
  branches: {
    master: process.env.INPUT_MASTER || `master`,
    mergeQueue: process.env.INPUT_MERGEQUEUE || `merge-queue`,
  },
};

exports.getConfiguration = async git => {
  let configFile;
  try {
    configFile = await git(`show`, `${exports.BASE_CONFIGURATION.branches.master}:chenille.yml`);
  } catch {}

  return {
    ...configFile ? yaml.load(configFile) : {},
    ...exports.BASE_CONFIGURATION,
  };
};
