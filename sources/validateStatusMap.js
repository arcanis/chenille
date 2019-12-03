exports.validateStatusMap = statusMap => {
  let pending = false;

  for (const title of titles) {
    const status = statusMap.get(title);
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
