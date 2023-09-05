const randomType = {
  getRondomLower() {
    //fromCharCode() 可接受一个指定的 Unicode 值，然后返回一个字符串。
    // 注意：该方法是 String 的静态方法，字符串中的每个字符都由单独的 Unicode 数字编码指定。使用语法： String.fromCharCode()。
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  },
  getRandomUpper() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  },
  getRandomNumber() {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
  },
  getRandomSymbol() {
    const symbols = "!@#$%";
    return symbols[Math.floor(Math.random() * symbols.length)];
  },
};

function randomPassword() {
  const symbol = randomType.getRandomSymbol();

  let number = "";
  [1, 2].map((item) => {
    number += randomType.getRandomNumber();
  });
  let low = "";
  [1, 2, 3, 4].map((item) => {
    low += randomType.getRondomLower();
  });
  let up = "";
  [1, 2, 3, 4].map((item) => {
    up += randomType.getRandomUpper();
  });
  const str = low + symbol + up + number;
  return disorganize(str, 11);
}

function disorganize(str) {
  if (typeof str !== "string") return str;
  var newStrArray = [];
  str.split("").forEach((item, index, array) => {
    var newIndex = Math.round(Math.random() * newStrArray.length);
    newStrArray.splice(newIndex, 0, item);
  });

  return newStrArray.join("");
}

module.exports.randomPassword = randomPassword;
