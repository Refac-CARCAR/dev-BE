const jwt = require("jsonwebtoken");

const loginRequired = (req, res, next) => {
  // request 헤더로부터 authorization bearer 토큰을 받음.
  const userToken = req.headers["authorization"]?.split(" ")[1];

  // 이 토큰은 jwt 토큰 문자열이거나, 혹은 "null" 문자열이거나, undefined임.
  // 토큰이 undefined이거나 "null"일 경우, login_required 가 필요한 서비스 사용을 제한함.
  if (!userToken || userToken === "null") {
    console.log(
      "서비스 사용 요청이 있습니다. 하지만, Authorization 토큰: 없음"
    );
    res.status(403).json({
      result: "forbidden-approach",
      reason: "로그인한 유저만 사용할 수 있는 서비스입니다.",
    });
  }

  try {
    /** 우리가 발행한 토큰임을 확인하는 열쇠 */
    const secretKey = process.env.JWT_SECRET_KEY;
    // userToken이 secretKey와 맞는 지 확인하는 작업
    const jwtDecoded = jwt.verify(userToken, secretKey);

    const userId = jwtDecoded.userId;
    const role = jwtDecoded.role;

    // req에 currentUserId라는 속성을 추가하여
    // 라우터에서 req.currentUserId를 통해 검증된 유저의 id에 접근 가능하게 됌
    req.currentUserId = userId;
    req.currentRole = role;

    next();
  } catch (error) {
    // jwt.verify 함수가 에러를 발생시키는 경우는 토큰이 정상적으로 decode 안되었을 경우임.
    res.status(403).json({ reason: "정상적인 토큰이 아닙니다." });
  }
};

module.exports = { loginRequired };
