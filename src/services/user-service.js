const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { userModel } = require("../db/models/user-model");

class UserService {
  // 회원가입
  async addUser(userInfo) {
    const { email, fullName, password, passwordConfirm, phoneNumber, address } = userInfo;

    // 이름 - 한글,영문,띄어쓰기 가능, 2자 이상
    const regName = /^[가-힣a-zA-Z\s]{2,}$/;
    if (!regName.test(fullName)) {
      const err = new Error("올바른 이름을 입력해주세요.")
      err.status = 400;
      throw err;
    }

    // 이메일 형식 확인(RFC 5322 형식 - 99.99% 검증가능)
    const regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
    if(!regex.test(email)) {
      const err = new Error("이메일 형식이 맞지 않습니다.");
      err.status = 400;
      throw err;
    }

    // 이메일 중복 확인
    const user = await userModel.findByEmail(email);
    if (user) {
      const err = new Error("이 이메일은 현재 사용중입니다.");
      err.status = 400;
      throw err;
    }
    
    // 전화번호 정규식 확인('-' 없이 01X~ (10~11자리 숫자))
    const regPhone = /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/;
    if (!regPhone.test(phoneNumber)) {
      const err = new Error(`'-'을 제외한 올바른 전화번호를 입력해주세요.`);
      err.status = 400;
      throw err;
    }

    // 비밀번호 11자리 이상 확인
    if (password.length < 11) {
      const err = new Error("비밀번호가 11자리를 넘지 않습니다. 다시 확인해주세요.")
      err.status = 400;
      throw err;
    }

    // 비밀번호와 비밀번호확인 입력값이 같은지 확인
    if (password !== passwordConfirm) {
      const err = new Error("비밀번호 확인값이 일치하지 않습니다.");
      err.status = 400;
      throw err;
    }

    // 비밀번호 해쉬화(암호화)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 전달받은 값을 가지고 새로운 user 정보를 생성
    const newUserInfo = {
      full_name: fullName,
      email,
      password: hashedPassword,
      phone_number: phoneNumber,
      address: {
        postal_code: address.postalCode,
        address_main: address.addressMain,
        address_detail: address.addressDetail,
      },
    };

    // db에 저장
    const createdNewUser = await userModel.create(newUserInfo);

    return createdNewUser;
  }

  // 로그인
  async getUserToken(loginInfo) {
    // req.body에서 넘어온 입력값
    const { email, password } = loginInfo;

    // 이메일 형식 확인(RFC 5322 형식 - 99.99% 검증가능)
    const regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
    if(!regex.test(email)) {
      const err = new Error("이메일 형식이 맞지 않습니다.");
      err.status = 400;
      throw err;
    }

    // 우선 해당 이메일의 사용자 정보가  db에 존재하는지 확인
    const user = await userModel.findByEmail(email);
    if (!user) {
      const err = new Error("해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.");
      err.status = 404;
      throw err;
    }

    // 비밀번호 일치 여부 확인
    // 매개변수의 순서 중요 (1번째는 프론트가 보내온 비밀번호, 2번쨰는 db에 있던 암호화된 비밀번호)
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      const err = new Error("비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.");
      err.status = 401;
      throw err;
    }

    // 로그인 성공 -> JWT 웹 토큰 생성, 테스트용으로 "secret-key"를 넣어놓음(env파일 작성 안해놓아서)
    const secretKey = process.env.JWT_SECRET_KEY || "secret-key";

    // user_id, role을 jwt 토큰에 담음
    const token = jwt.sign({ userId: user._id, role: user.role }, secretKey);

    return { token };
  }

  // 유저 상세 조회
  async getUserById(userId) {
    const user = await userModel.findById(userId);

    return user;
  }

  // 유저정보 수정, 현재 비밀번호가 있어야 수정 가능함.
  async setUser(userId, infoToUpdate) {
    // req.body에서 받아온 입력값
    const {
      fullName,
      currentPassword,
      passwordToChange,
      phoneNumber,
      postalCode,
      addressMain,
      addressDetail,
    } = infoToUpdate;

    // 현재 비밀번호가 입력값으로 넘어오지 않았다면 예외처리
    if (!currentPassword) {
      const err = new Error("정보를 변경하려면, 현재의 비밀번호가 필요합니다.");
      err.status = 400;
      throw err;
    }

    // 현재 비밀번호와 변경할 비밀번호가 같으면 예외처리
    if (currentPassword === passwordToChange) {
      const err = new Error("현재 비밀번호와 변경할 비밀번호가 같습니다.");
      err.status = 400;
      throw err;
    }

    // userId값을 가진 유저가 db에 있는지 확인
    let user = await userModel.findById(userId);

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!user) {
      const err = new Error("가입 내역이 없습니다. 다시 한 번 확인해 주세요.");
      err.status = 404;
      throw err;
    }

    // 비밀번호 일치 여부 확인
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      const err = new Error("현재 비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.");
      err.status = 401;
      throw err;
    }

    // 비밀번호도 변경하는 경우에는, 회원가입 때처럼 해쉬화 해주어야 함.
    if (passwordToChange) {
      const newPasswordHash = await bcrypt.hash(passwordToChange, 10);
      infoToUpdate.passwordToChange = newPasswordHash;
    }

    // 업데이트 진행

    // 입력값들이 truthy하다면 업데이트용 객체 생성
    const toUpdateUserAddressModel = {
      ...(postalCode && { postal_code: postalCode }),
      ...(addressMain && { address_main: addressMain }),
      ...(addressDetail && { address_detail: addressDetail }),
    };
    const toUpdateUserModel = {
      ...(fullName && { full_name: fullName }),
      ...(passwordToChange && { password: passwordToChange }),
      address: toUpdateUserAddressModel,
      ...(phoneNumber && { phone_number: phoneNumber }),
    };

    user = await userModel.update({
      userId,
      update: toUpdateUserModel,
    });

    return user;
  }

  // 유저정보 삭제, 현재 비밀번호가 있어야 탈퇴 가능함.
  async deleteUser(userId, currentPassword) {
    // jwt 토큰에서 검증된 id와 같은 id가 있는지 확인
    const user = await userModel.findById(userId);

    if (!user) {
      const err = new Error(
        "해당 유저는 존재하지 않습니다. 다시 한 번 확인해 주세요."
      );
      err.status = 404;
      throw err;
    }

    // db에 일치하는 id가 있다면 비밀번호 일치 여부 확인
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      const err = new Error(
        "현재 비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요."
      );
      err.status = 401;
      throw err;
    }

    // id와 비밀번호가 일치하다면 사용자 정보 삭제
    await userModel.delete(userId);

    return;
  }

  // 관리자: 모든 유저 목록 조회
  async getUsers() {
    const users = await userModel.findAll();

    return users;
  }

  // 관리자: 선택한 유저 정보 삭제
  async deleteUserByAdmin(email) {
    const deleteUser = await userModel.deleteByAdmin(email);
    if (!deleteUser) {
      const err = new Error("삭제되지 않았습니다.");
      err.status = 404;
      throw err;
    }
    return;
  }

}

/** 유저서비스 객체 */
const userService = new UserService(userModel);

module.exports = { userService };
