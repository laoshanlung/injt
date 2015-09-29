module.exports = function Product(User) {
    class Model {
        constructor() {
            this.name = 'product';
            this.user = new User();
        }
    }

    return Model;
};
