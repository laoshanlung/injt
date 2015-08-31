module.exports = function (Service, User) {
    return {
        p: function() {
            console.log(Service.r);
            console.log(new User());
        }
    };
};
