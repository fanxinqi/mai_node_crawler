const axios = require("axios");
const getProxy = require("./get-proxy.js");

const getFileStream = async (url) => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      // proxy:getProxy
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = getFileStream;
