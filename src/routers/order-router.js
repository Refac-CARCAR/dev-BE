const { Router } = require("express");

const { loginRequired } = require("../middlewares/login-required");
const { asyncHandler } = require("../utils/async-handler");
const { orderService } = require("../services/order-service");

const orderRouter = Router();

// 주문 추가 & 완료
orderRouter.post(
  "/",
  loginRequired,
  asyncHandler(async (req, res) => {
    const userId = req.currentUserId; // user_id를 JWT 로직을 진행시켜서 찾아오기

    const orderedProducts = req.body; // 주문한 상품 불러오기

    const order = await orderService.addOrder(orderedProducts, userId);

    res.status(201).json(order);
  })
);

// 유저가 주문한 모든 주문 조회
orderRouter.get(
  "/",
  loginRequired,
  asyncHandler(async (req, res) => {
    const userId = req.currentUserId;

    const order = await orderService.getOrdersOfUser(userId);

    res.status(200).json(order);
  })
);

// 유저가 주문한 주문 중 하나 조회
orderRouter.get(
  "/:id",
  loginRequired,
  asyncHandler(async (req, res) => {
    const userId = req.currentUserId;
    const orderId = req.params.id;

    const order = await orderService.getOrderOneOfUser(userId, orderId);

    res.status(200).json(order);
  })
);

// 주문 수정
orderRouter.put(
  "/:id",
  loginRequired,
  asyncHandler(async (req, res) => {
    const userId = req.currentUserId;
    const orderId = req.params.id;
    const address = req.body.address;

    const order = await orderService.updateOrder(userId, orderId, address);

    res.status(200).json(order);
  })
);

// 주문 취소
orderRouter.delete(
  "/:id",
  loginRequired,
  asyncHandler(async (req, res) => {
    const userId = req.currentUserId;
    const orderId = req.params.id;

    await orderService.deleteOrder(userId, orderId);

    res.status(204).json({ message: "delete success" });
  })
);

module.exports = { orderRouter };
