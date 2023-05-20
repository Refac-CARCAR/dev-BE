const { productModel } = require("../db/models/product-model");

class ProductService {
  async getProductsAll() {
    return await productModel.getProductsAll();
  }
  async getProductsByCategory(category) {
    return await productModel.getProductsByCategory(category);
  }
  async getProductById(product_id) {
    return await productModel.getProductById(product_id);
  }
  async addProduct(product) {
    return await productModel.addProduct(product);
  }
  async updateProduct(id, body, option) {
    return await productModel.updateProduct(id, body, option);
  }
  async deleteProduct(id) {
    return await productModel.deleteProduct(id);
  }
}

const productService = new ProductService();
module.exports = { productService };
