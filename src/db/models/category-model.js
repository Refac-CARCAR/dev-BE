const { Category } = require("../schemas/category-schema");

class CategoryModel {
  async getAllCategories() {
    const categoryList = await Category.find({});
    return categoryList;
  }
  async findCategory(name) {
    const selectedCategory = await Category.findOne(name);
    return selectedCategory;
  }
  async addCategory(newOne) {
    const newCategory = await Category.create(newOne);
    return newCategory;
  }
  async updateCategory(name, body, option) {
    const updatedCategory = await Category.findOneAndUpdate(name, body, option);
    return updatedCategory;
  }
  async deleteCategory(name) {
    const deletedCategory = await Category.findOneAndDelete({ name });
    return deletedCategory;
  }
}

const categoryModel = new CategoryModel();

module.exports = { categoryModel };
