/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git} from './git/openRepository';

export function normalizeStatusMap(git: Git, statusMap: Map<string, boolean | null>) {
  if (!git.config.requiredStatus)
    return statusMap;

  return new Map(git.config.requiredStatus.map(title => {
    return [title, statusMap.get(title)];
  }));
};
