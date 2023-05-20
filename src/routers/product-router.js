const { Router } = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { productService } = require("../services/product-service");

const productRouter = Router();
productRouter.get(
  "/",
  asyncHandler(async (req, res, next) => {
    // 상품의 카테고리로 이동
    if (Object.keys(req.query).length > 0) {
      const productsByCategory = await productService.getProductsByCategory(
        req.query.categories
      );
      res.status(200).json(productsByCategory);
    } else {
      // 상품 전체페이지로 이동
      const productList = await productService.getProductsAll();
      res.status(200).json(productList);
    }
  })
);

productRouter.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const productId = req.params.id;
    const product = await productService.getProductById(productId);
    res.status(200).json(product);
  })
);

module.exports = { productRouter };
