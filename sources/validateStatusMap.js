exports.validateStatusMap = statusMap => {
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
