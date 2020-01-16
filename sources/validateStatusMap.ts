/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {PrStatus, StatusMap} from './types';

export function validateStatusMap(statusMap: StatusMap): PrStatus {
  const rejectionLines = [];
  let pending = false;

  for (const [title, {href, ok}] of statusMap.entries()) {
    if (ok === false) {
      if (href != null) {
        rejectionLines.push(`- ${title}\n`);
      } else {
        rejectionLines.push(`- [${title}](${href})\n`);
      }
    }

    if (typeof ok === `undefined` || ok === null) {
      pending = true;
    }
  }

  if (rejectionLines.length > 0) {
    return {
      ok: false,
      message: rejectionLines.join(``),
    }
  }

  if (pending) {
    return {ok: null};
  } else {
    return {ok: true};
  }
};
