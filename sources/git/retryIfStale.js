exports.retryIfStale = async (cb) => {
  do {
    try {
      return await cb();
    } catch (error) {
      if (error.stdout.includes(`(stale info)`)) {
        continue;
      } else {
        throw error;
      }
    }
  } while (false);
};
