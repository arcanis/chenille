/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {UsageError} from 'clipanion';
import {readFileSync} from 'fs';

export const getEventFile = () => {
  if (!process.env.GITHUB_EVENT_PATH)
    throw new UsageError(`Assertion failed: Missing GITHUB_EVENT_PATH environment variable`);

  const content = readFileSync(process.env.GITHUB_EVENT_PATH, `utf8`);
  const data = JSON.parse(content);

  return data;
};
