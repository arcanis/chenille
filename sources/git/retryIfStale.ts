/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
export const retryIfStale = async <T>(cb: () => Promise<T>) => {
  do {
    try {
      return await cb();
    } catch (error) {
      if (error.stdout && error.stdout.includes(`(stale info)`)) {
        continue;
      } else {
        throw error;
      }
    }
  } while (false);
  
  throw new Error(`Unreachable`);
};
