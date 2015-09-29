module.exports = function Product(User) {
    class Product {
        constructor() {
            this.name = 'product';
            this.user = new User();
        }
    }

    return Product;
}