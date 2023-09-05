const request = require("../../../../utils/request");
const log = require("../../../../utils/log");

// 获取注册手机号
module.exports.getPhone = async () => {
  try {
    const phone = await request.getHtml(
      "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/get_phone",
      {},
      {
        isJquery: false,
      }
    );
    return phone;
  } catch (error) {
    console.log(error);
  }
};

// 获取验证码
module.exports.getCode = async (phone) => {
  try {
    await request.getHtml(
      "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/get_code",
      {
        phone,
      },
      {
        isJquery: false,
      }
    );
  } catch (error) {
    console.log(error);
  }
};
