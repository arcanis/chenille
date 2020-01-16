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
    const source = statusMap.get(title);

    const casted = typeof source !== `undefined`
      ? source
      : {href: undefined, ok: null};

    return [title, casted];
  }));
};
