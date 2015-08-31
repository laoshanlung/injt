module.exports = function Service(_, User) {
    var user = new User();
    return {
        random: _.random(0, 100),
        user: user
    };
};
