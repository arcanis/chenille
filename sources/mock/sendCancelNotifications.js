exports.sendCancelNotifications = async (prs) => {
    if (!global.__mocks__)
        global.__mocks__ = {};

    if (!global.__mocks__.notifications)
        global.__mocks__.notifications = [];

    global.__mocks__.notifications.push(...prs);
};
