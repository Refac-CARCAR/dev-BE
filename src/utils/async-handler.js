/**
 * 모든 router에 하나하나 try-catch를 쓰기보다 error가 발생했는지 확인해준다.
 */
const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res);
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { asyncHandler };
