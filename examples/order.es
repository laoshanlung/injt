module.exports = function Order(Product, User) {
    class Model {
        constructor() {
            this.name = 'order';
            this.product = new Product();
            this.user = new User();
        }
    }

    return Model;
}