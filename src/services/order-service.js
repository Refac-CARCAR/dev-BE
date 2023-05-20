const { orderModel } = require("../db/models/order-model");
const { productService } = require("../services/product-service");
const { userService } = require("../services/user-service");
const { OrderedProduct } = require("../db/schemas/order-schema");

class OrderService {
  // 주문을 추가하고 완성된 값을 반환
  async addOrder(orderedProducts, userId) {
    // 주문한 품목이 존재하는지 확인하고 존재한다면 products에 저장
    const products = await Promise.all(
      orderedProducts.map(async (orderedProduct) => {
        const orderedProductId = orderedProduct.productId;
        const product = await productService.getProductById(orderedProductId);
        if (!product) {
          const err = new Error("상품이 존재하지 않습니다.");
          err.status = 404;
          throw err;
        }
        return product;
      })
    );

    // products에 저장된 상품의 정보로 OrderedProdcutSchema의 속성에 일치하도록 작성합니다.
    const newOrderedProduct = products.map((product, idx) => {
      const amount = orderedProducts[idx].amount;
      const productId = product.product_id;
      const name = product.name;
      const description = product.description;
      const maker = product.maker;
      const price = product.price;
      const image = product.image;
      const totalPrice = price * amount;

      return new OrderedProduct({
        product_id: productId,
        name,
        description,
        maker,
        amount,
        price,
        image,
        total_price: totalPrice,
      });
    });

    // 추가될 order의 total_price와 address, user_name을 작성합니다.
    const orderTotalPrice = newOrderedProduct.reduce((acc, cur) => {
      return acc + cur.total_price;
    }, 0);

    const user = await userService.getUserById(userId);

    const userAddress = user.address;
    const userName = user.full_name;
    const userPhoneNumber = user.phone_number;

    const newOrder = await orderModel.create({
      user_id: userId,
      user_name: userName,
      user_phone: userPhoneNumber,
      ordered_product: newOrderedProduct,
      address: userAddress,
      total_price: orderTotalPrice,
    });

    return newOrder;
  }

  // 사용자가 주문한 모든 주문을 조회하는 서비스 로직
  async getOrdersOfUser(userId) {
    const order = await orderModel.findByUserId(userId);

    return order;
  }

  // 사용자가 주문한 주문 중 order_id와 일치하는 주문 하나만 조회하는 서비스 로직
  async getOrderOneOfUser(userId, orderId) {
    const order = await orderModel.findById(orderId);

    if (!order) {
      const err = new Error("주문을 찾을 수 없습니다.");
      err.status = 404;
      throw err;
    }

    if (userId !== order.user_id) {
      const err = new Error("권한이 없습니다.");
      err.status = 403;
      throw err;
    }

    return order;
  }

  // 주문 수정
  async updateOrder(userId, orderId, address) {
    const order = await orderModel.findById(orderId);

    if (!order) {
      const err = new Error("주문을 찾을 수 없습니다.");
      err.status = 404;
      throw err;
    }

    if (order.shipping_status !== "배송준비중") {
      const err = new Error("주문을 수정할 수 없습니다.");
      err.status = 403;
      throw err;
    }

    if (order.user_id !== userId) {
      const err = new Error("권한이 없습니다.");
      err.status = 403;
      throw err;
    }

    // 수정에 사용될 옵션 정의
    const options = {
      new: true, // 새로운 문서 반환
      fields: { _id: 0 }, // _id 필드를 반환하지 않고, createdAt 필드를 반환
    };

    const update_order = await orderModel.update(orderId, address, options);

    return update_order;
  }

  // 주문 취소
  async deleteOrder(userId, orderId) {
    const order = await orderModel.findById(orderId);

    if (!order) {
      const err = new Error("주문을 찾을 수 없습니다.");
      err.status = 404;
      throw err;
    }

    if (order.shipping_status !== "배송준비중") {
      const err = new Error("주문을 취소할 수 없습니다.");
      err.status = 403;
      throw err;
    }

    if (order.user_id !== userId) {
      const err = new Error("권한이 없습니다.");
      err.status = 403;
      throw err;
    }

    await orderModel.delete(orderId);

    return;
  }

  // 관리자: 모든 주문 확인 가능
  async getOrdersOfAdmin() {
    const orders = await orderModel.findAll();

    return orders;
  }

  // 관리자: 배송 상태를 변경
  async changeShippingStatus(orderId, shippingStatus) {
    const order = await orderModel.findById(orderId);

    if (!order) {
      const err = new Error("주문을 찾을 수 없습니다.");
      err.status = 404;
      throw err;
    }

    // 업데이트 값
    const updateShippingStatus = {
      shipping_status: shippingStatus,
    };

    const updateOrder = await orderModel.updateShippingStatus(
      orderId,
      updateShippingStatus
    );

    return updateOrder;
  }

  // 관리자: 주문 삭제
  async deleteOrderByAdmin(orderId) {
    const order = await orderModel.findById(orderId);

    if (!order) {
      const err = new Error("주문을 찾을 수 없습니다.");
      err.status = 404;
      throw err;
    }

    await orderModel.delete(orderId);

    return;
  }
}

const orderService = new OrderService();

module.exports = { orderService };
