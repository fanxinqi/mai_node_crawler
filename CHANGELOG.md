# Changelog

## 2023-06-13

### Features

#### gongsir task 迭代
<abbr title="Hyper Text Markup Language">注意：B站修改了gongsir url,任务下发的keyword要求修改格式示例：/gongsi/job/ad1fe6326cf29f5a1HJ_3di0.html</abbr>
- 职位分类获取数据获取修改
- 职位下拉筛选条件选项数据获取需改，结构有调整
- 职位数据修改，字段有减少
- 空状态识别修改
- 数据中添加版本号version = 'v2'，用于区分新老版本数据
- 封禁状态修改

##### 数据结构

```json
{
  "type": "gongsir",
  "cid": "/gongsi/job/480261c022ea03d81nV53tQ~.html",
  "instance": "",
  "selecters": [
    [
      "全部",
      "北京",
      "杭州",
      "深圳",
      "上海",
      "成都",
      "武汉",
      "湘西土家族苗族自治州",
      "广州",
      "哈尔滨",
      "无锡",
      "南京",
      "铜仁",
      "天津",
      "烟台",
      "淮安",
      "东莞",
      "海口",
      "惠州",
      "佛山",
      "江门",
      "清远",
      "中山",
      "澄迈",
      "昭通",
      "曲靖",
      "重庆",
      "南充",
      "云浮",
      "长春",
      "苏州",
      "徐州",
      "合肥",
      "自贡",
      "绵阳",
      "达州",
      "乐山",
      "肇庆",
      "沈阳",
      "大连",
      "锦州",
      "石家庄",
      "淄博",
      "潍坊",
      "菏泽",
      "滨州",
      "镇江",
      "舟山",
      "蚌埠",
      "宿州",
      "淮北",
      "福州",
      "泉州",
      "长沙",
      "贵阳",
      "宜宾",
      "眉山",
      "阿坝藏族羌族自治州",
      "珠海",
      "阳江",
      "南宁",
      "淮南",
      "宣城",
      "黄山",
      "上饶"
    ],
    [
      "不限",
      "在校生",
      "应届生",
      "1年以内",
      "1-3年",
      "3-5年",
      "5-10年",
      "10年以上"
    ],
    ["不限", "初中及以下", "中专/中技", "高中", "大专", "本科", "硕士", "博士"],
    ["不限", "3K以下", "3-5K", "5-10K", "10-20K", "20-50K", "50K以上"]
  ],
  "职位类型": [
    {
      "url": "/gongsi/job/480261c022ea03d81nV53tQ~.html",
      "text": "全部(4469)"
    },
    {
      "url": "/gongsi/job/100000/480261c022ea03d81nV53tQ~.html",
      "text": "技术(3381)"
    },
    {
      "url": "/gongsi/job/110000/480261c022ea03d81nV53tQ~.html",
      "text": "产品(460)"
    },
    {
      "url": "/gongsi/job/130000/480261c022ea03d81nV53tQ~.html",
      "text": "运营(233)"
    },
    {
      "url": "/gongsi/job/120000/480261c022ea03d81nV53tQ~.html",
      "text": "设计(161)"
    },
    {
      "url": "/gongsi/job/140000/480261c022ea03d81nV53tQ~.html",
      "text": "市场(117)"
    },
    {
      "url": "/gongsi/job/150000/480261c022ea03d81nV53tQ~.html",
      "text": "人力/财务/行政(48)"
    },
    {
      "url": "/gongsi/job/160000/480261c022ea03d81nV53tQ~.html",
      "text": "销售(20)"
    },
    {
      "url": "/gongsi/job/260000/480261c022ea03d81nV53tQ~.html",
      "text": "咨询/翻译/法律(14)"
    },
    {
      "url": "/gongsi/job/180000/480261c022ea03d81nV53tQ~.html",
      "text": "金融(12)"
    },
    {
      "url": "/gongsi/job/190000/480261c022ea03d81nV53tQ~.html",
      "text": "教育培训(7)"
    },
    {
      "url": "/gongsi/job/170000/480261c022ea03d81nV53tQ~.html",
      "text": "传媒(6)"
    },
    {
      "url": "/gongsi/job/250000/480261c022ea03d81nV53tQ~.html",
      "text": "采购/贸易(5)"
    },
    {
      "url": "/gongsi/job/240000/480261c022ea03d81nV53tQ~.html",
      "text": "供应链/物流(1)"
    },
    {
      "url": "/gongsi/job/300000/480261c022ea03d81nV53tQ~.html",
      "text": "生产制造(1)"
    },
    {
      "url": "/gongsi/job/310000/480261c022ea03d81nV53tQ~.html",
      "text": "高级管理(1)"
    }
  ],
  "page": 1,
  "职位": [
    {
      "title": "数据分析师",
      "area": "北京 ·海淀区 ·上地",
      "salary": "300-350元/天",
      "tags": ["本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "王女士·增长渠道分析经理"
    },
    {
      "title": "Android开发工程师【X3】",
      "area": "北京 ·海淀区 ·上地",
      "salary": "30-60K·16薪",
      "tags": ["1-3年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "孙女士·HR"
    },
    {
      "title": "高级Java开发工程师-【内容安全中心】",
      "area": "北京 ·海淀区 ·上地",
      "salary": "35-65K·16薪",
      "tags": ["1-3年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "李女士·高级数据分析师"
    },
    {
      "title": "服务端测试工程师【acfun】",
      "area": "北京 ·海淀区 ·上地",
      "salary": "20-40K·15薪",
      "tags": ["3-5年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "周先生·招聘者"
    },
    {
      "title": "Java技术专家（投放选品方向）",
      "area": "杭州 ·余杭区 ·仓前",
      "salary": "30-60K·16薪",
      "tags": ["3-5年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "王先生·后端技术专家"
    },
    {
      "title": "测试开发工程师",
      "area": "北京 ·海淀区 ·西三旗",
      "salary": "25-35K·16薪",
      "tags": ["5-10年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "王先生·高级测试开发工程师"
    },
    {
      "title": "产品经理",
      "area": "北京 ·海淀区 ·上地",
      "salary": "200-300元/天",
      "tags": ["本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "陈先生·商业化产品专家"
    },
    {
      "title": "Java技术专家",
      "area": "北京 ·海淀区 ·上地",
      "salary": "50-70K·16薪",
      "tags": ["5-10年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "马先生·高级Java研发工程师"
    },
    {
      "title": "心理辅导员（六险一金、正编）",
      "area": "铜仁 ·碧江区 ·碧江区人民法院",
      "salary": "6-10K·13薪",
      "tags": ["1-3年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "吴女士·HR实习生"
    },
    {
      "title": "前端开发工程师",
      "area": "北京 ·海淀区 ·上地",
      "salary": "25-35K·16薪",
      "tags": ["经验不限", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "沈女士·HR"
    },
    {
      "title": "高级java开发工程师",
      "area": "杭州 ·余杭区 ·仓前",
      "salary": "30-60K",
      "tags": ["3-5年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "王先生·快手Java开发工程师"
    },
    {
      "title": "上海松江区APP推广，一对一教学",
      "area": "上海 ·静安区 ·彭浦",
      "salary": "15-30K",
      "tags": ["经验不限", "学历不限"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "伍先生·招聘者"
    },
    {
      "title": "Java",
      "area": "北京 ·海淀区 ·马连洼",
      "salary": "15-16K",
      "tags": ["1-3年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "臧先生·消息队列架构师"
    },
    {
      "title": "Java",
      "area": "杭州 ·余杭区 ·仓前",
      "salary": "35-60K·15薪",
      "tags": ["3-5年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "郑先生·招聘者"
    },
    {
      "title": "测试开发工程师",
      "area": "杭州 ·西湖区 ·黄龙",
      "salary": "30-55K·14薪",
      "tags": ["5-10年", "本科"],
      "is_online": false,
      "icon_url": "https://img.bosszhipin.com/static/file/2021/1wgkhwata61639388719175.jpg",
      "name": "黄先生·高级工程师"
    }
  ]
}
```

##### 空参考

![空状态](https://i9.taou.com/maimai/p/34292/5307_6_21UdSpeSoQoagybU)

![空状态](https://i9.taou.com/maimai/p/34292/7494_6_3JiCVQaHxkex36)
