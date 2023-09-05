module.exports = () => {
  let hostId = Math.round(Math.random() * 15);
  if (hostId < 10) {
    hostId = "0" + hostId;
  }
  return {
    protocol: "http",
    host: `proxy-${hostId}.int.taou.com`,
    port: 8888,
  };
};
