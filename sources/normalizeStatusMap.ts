/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git, StatusMap} from './types';

export function normalizeStatusMap(git: Git, statusMap: StatusMap) {
  if (!git.config.requiredStatus)
    return statusMap;

  return new Map(git.config.requiredStatus.map(title => {
    let result = statusMap.get(title);

    if (typeof result === `undefined`)
      result = null;

    return [title, result];
  }));
};
