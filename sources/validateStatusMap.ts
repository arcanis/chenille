/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {StatusMap} from './types';

export function validateStatusMap(statusMap: StatusMap) {
  let pending = false;

  for (const status of statusMap.values()) {
    if (status === false)
      return false;

    if (typeof status === `undefined` || status === null) {
      pending = true;
    }
  }

  if (pending) {
    return null;
  } else {
    return true;
  }
};
