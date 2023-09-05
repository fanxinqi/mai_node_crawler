const { getConsumeTask } = require("../service/mack");
let index = 0;

const mackData = [
  {
    type: "job",
    keyword: "/job_detail/cd4e166b599ef8fd1Xdz3Nu1FVNX.html",
    password: "y9fQ2uU$IEi",
  },
];

const getMockFn = () => {
  let index = 0;
  return function () {
    const data = mackData[index];
    index++;
    return data;
  };
};
const getmock = getMockFn();
let i = 0;
while (i < 20) {
  i++;
  console.log(getConsumeTask());
}
