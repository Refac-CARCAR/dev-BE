const { Product } = require("../schemas/product-schema");

class ProductModel {
  async getProductById(product_id) {
    const product = await Product.findOne({ product_id });
    return product;
  }

  async getProductsAll() {
    const productList = await Product.find({});
    return productList;
  }

  async getProductsByCategory(category) {
    const productList = await Product.find({ category: category });
    return productList;
  }

  async addProduct(product) {
    const newProduct = await Product.create(product);
    return newProduct; // 새로 생성된 상품 정보를 응답으로 전달
  }

  async updateProduct(id, body, option) {
    const updatedProduct = await Product.findOneAndUpdate(id, body, option);
    return updatedProduct; // 수정된 상품 정보를 응답으로 전달
  }

  async deleteProduct(id) {
    const deletedProduct = await Product.findOneAndDelete({ product_id: id });
    return deletedProduct; // 삭제된 상품 정보를 응답으로 전달
  }
}

const productModel = new ProductModel();
module.exports = { productModel };
