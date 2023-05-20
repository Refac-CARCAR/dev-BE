const isAdmin = async (req, res, next) => {
  // 로그인한 user_id의 정보를 받아온다.
  try {
    const email = req.currentRole;

    const word = await WordModel.findOne({ short_id: id });
    return word;


    if (email !== word.owner) {
      const err = new Error("님 단어장이 아닙니다.");
      err.status = 403;
      throw err;
    }

    next();
  } catch (err) {
    next(err);
  }

  return;
};

module.exports = { isAdmin };
