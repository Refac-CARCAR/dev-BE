const { User } = require("../schemas/user-schema");

class UserModel {
  // email로 유저 찾기(요청값 활용)
  async findByEmail(email) {
    const user = await User.findOne({ email });
    return user;
  }

  // userId로 유저 찾기(jwt토큰 활용)
  async findById(userId) {
    // mongoose 공식문서 참고해주세요(https://mongoosejs.com/docs/api/model.html#Model.findById())
    const user = await User.findById(userId);
    return user;
  }

  // 회원가입할 때 새로운 유저를 생성
  async create(userInfo) {
    // 새로 생성된 유저는 createdNewUser에 저장된다.
    const createdNewUser = await User.create(userInfo);

    // 새로 생성된 user의 모든 정보를 보여주지 않고 제한된 값만 반환하도록 한다.
    return {
      full_name: createdNewUser.full_name,
      email: createdNewUser.email,
    };
  }

  // 사용자 정보를 수정
  async update({ userId, update }) {
    // 'userId'로 찾은 db document를 'update'로 교체
    return await User.findByIdAndUpdate(userId, update);
  }

  // 사용자 정보를 삭제
  async delete(userId) {
    return await User.findByIdAndDelete(userId);
  }

  // 관리자가 모든 유저를 조회할 때 사용
  async findAll() {
    const users = await User.find({});
    return users;
  }

  // 관리자가 선택한 1명의 사용자 정보를 삭제 
  async deleteByAdmin(email) {
    return await User.findOneAndDelete({ email });
  }
}

/** 유저모델 객체 */
const userModel = new UserModel();

module.exports = { userModel };
