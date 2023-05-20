const errorHandler = (error, req, res, next) => {
  // 터미널에 노란색으로 출력됨.
  console.log("\x1b[33m%s\x1b[0m", error.stack);

  // 에러 상태 코드를 가져옴
  const status = error.status || 400;

  // 에러는 상태 코드의 JSON 형태로 프론트에 전달됨
  res.status(status).json({ result: "error", reason: error.message });
};

module.exports = { errorHandler };
