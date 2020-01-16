/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git} from '../types';

export const fetchFromOrigin = async (git: Git, ...branches: string[]) => {
  const basicAuthToken = Buffer.from(`git:${process.env.GITHUB_TOKEN}`).toString(`base64`);
  const authHeader = `Authorization: basic ${basicAuthToken}`;

  await git(`-c`, `http.extraheader=${authHeader}`, `fetch`, `origin`, ...branches);
};
