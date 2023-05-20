const { categoryModel } = require("../db/models/category-model");

class CategoryService {
  async getAllCategories() {
    const categoryList = await categoryModel.getAllCategories();
    return categoryList;
  }
  async addCategory(newOne) {
    const newCategory = await categoryModel.addCategory(newOne);
    return newCategory;
  }
  async updateCategory(name, body, option) {
    const selectedCategory = await categoryModel.findCategory(name);

    // db에 없는 카테고리라면 에러처리
    if (!selectedCategory) {
      const err = new Error("찾으시는 카테고리를 다시 확인해주세요.");
      err.status = 404;
      throw err
    }

    const updatedCategory = await categoryModel.updateCategory(
      name,
      body,
      option
    );
    return updatedCategory;
  }
  async deleteCategory(name) {
    const deletedCategory = await categoryModel.deleteCategory(name);
    return deletedCategory;
  }
}

const categoryService = new CategoryService();
module.exports = { categoryService };
