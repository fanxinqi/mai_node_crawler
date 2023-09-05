# 爬虫工具

> 1. 可分布式：任务驱动，客户端可部署到不同机器或开启进程分布式执行爬取任务，而不重复
> 2. 伪装性： 有反爬伪装处理:ip 切换，识别特征抹除等
> 3. 健壮性：错误异常处理机制
> 4. 速度快：爬取速度 秒级
> 5. 开发效率：所有爬取任务为单位，可利用模版快速爬创建爬取一个页面任务，懂 jquery 就 OK

## docker

```docker pull
docker run -e PROXY='proxyserver' -e TAG='proxy-100' -e UA='ua' --name=node_crawler_container  node_crawler:1.0.0
```

## 常规

### node 安装

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 12.8.0
```

### node 进程管理工具 pm2 安装

```
npm install -g pm2
```

### 项目依赖安装

```bash
npm install
```

### 启动

pm2 start node --name liepin1 -- index.js +脚本参数 如下

```
Options:
  -p, --proxy <type>     proxy server address (default: "")
  -u, --ua <type>        The User-Agent request header is a characteristic string that lets servers and network peers identify the
                         application, operating system, vendor, and/or version of the requesting user agent (default: "")
  -i, --instance <type>  proxy ip change server instance and change task type (default: "")
  -s, --sleep  <type>    how long to wait after switching ip, in milliseconds (default: 0)
  -r, --retry  <type>    number of retry error task (default: 0)
  -n, --number  <type>   number of  retry get selector form page (default: 0)
  -h, --help             display help for command
```

日志

```
out log：/root/.pm2/logs/node-out.log
error log：/root/.pm2/logs/node-error.log
tail -f /root/.pm2/logs/node-out.log
```

### 开发

#### 任务

```
📦task
 ┣ 📜company_list.js boss公司列表任务
 ┣ 📜geek.js         boss搜索任务
 ┣ 📜get_consume_task.js  获取任务的任务
 ┣ 📜gongsi.js   boss公司爬取任务
 ┣ 📜gongsir.js  boss公司职位爬取任务
 ┣ 📜index.js    任务注册入口
 ┣ 📜lgeek.js   猎聘公司搜索爬取任务（暂无）
 ┣ 📜lgongsi.js 猎聘公司爬取任务
 ┣ 📜lgongsir.js 猎聘公司职位搜索爬取任务
 ┗ 📜ljob.js 猎聘职位爬取任务

```

#### service

server 交互等处理

```
📦service
┗ 📜index.js
```

#### utils

```
📦utils
┣ 📜SyncBailHook.js       任务流工具
┣ 📜browser-page.js       浏览器相关封装
┣ 📜feishu.js             飞书通知工具
┣ 📜get-commander-opts.js 命令行工具
┣ 📜log.js                日志工具
┣ 📜request.js http       网络请求
┣ 📜rpc.js rpc            网络请求
┣ 📜safety-container.js   boss、猎聘安全打开逻辑
┗ 📜sleep.js              睡眠函数
```

#### 入口

📜 index.js 任务 loop 入口

#### 后续开发

只需在 task 创建任务文件即可 eg：

```js
const newTask = async (context) => {
  //keyword 服务端约定任务关键字，一般为页面的url
  const { keyword } = context.task || {};
  // browerPage 浏览器对象，主要用opne方法即可
  const { browerPage, instance } = context;

  // 无数据的选择器
  const selecterNoData = ".job-result-empty";

  // 有数据的选择器
  const pageJobIner = ".page-job-inner"

  // loading page
  const $ = await browerPage.open(pageUrl, [
    selecterNoData,
    pageJobIner,
  ]);

  // $就是juqery,可以访问页面的dom对象了
  const data =  $('body').html();
  // 调用service报错数据即可
  return data;
};
module.exports = newTask
```
任务注册
``` js

// boss task
const geek = require("./geek");
const gongsi = require("./gongsi");
const gongsir = require("./gongsir");
const company_list = require("./company_list");

// liepin task
const lgongsi = require("./lgongsi");
const lgongsir = require("./lgongsir");
// const lgeek = require("./lgeek");
const ljob = require("./ljob");

const newTask = require('./newTask')

/*
 *  export all task
 */
module.exports = {
  geek,
  gongsi,
  gongsir,
  company_list,
  lgongsi,
  // lgeek,
  ljob,
  lgongsir,
  newTask
};

```
