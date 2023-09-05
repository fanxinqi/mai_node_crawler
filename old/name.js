const names = [
  "北京一只船教育科技有限公司",
  "北京延光清美科技有限公司",
  "钢研纳克检测技术股份有限公司",
  "北京格林威尔科技发展有限公司",
  "赞华（中国）电子系统有限公司",
  "华科技有限公司",
  "北京铝能清新环境技术有限公司",
  "恒壹（北京）医疗科技有限公司",
  "北京美科艺数码科技发展有限公司",
  "北京万户互联科技有限公司",
  "北京道迩科技有限公司",
  "国网智慧车联网技术有限公司",
  "北京飞鸟创想管理咨询有限公司",
  "北京燕山翔宇环保工程技术有限公司",
  "北京英沣特能源技术有限公司",
  "北京七星华电科技集团有限责任公司",
  "北京永道在线科技有限公司",
  "北京新兴华安智慧科技有限公司",
  "用友广信网络科技有限公司",
  "北京福田智蓝新能源汽车科技有限公司",
  "北京北方金证科技有限公司",
  "北京共易科技有限公司",
  "北京雅酷时空信息交换技术有限公司",
  "比业电子（北京）有限公司",
  "北京市中保网盾科技有限公司",
  "众芯汉创（北京）科技有限公司",
  "北京融易通信息技术有限公司",
  "北京龙软科技股份有限公司",
  "北京创立科创医药技术开发有限公司",
  "北京航天兴华科技有限公司",
  "北京优奈特能源工程技术有限公司",
  "煤炭科学技术研究院有限公司",
  "北京国遥新天地信息技术有限公司",
  "博尔诚（北京）科技有限公司",
  "北京伊诺凯科技有限公司",
  "北京悦康科创医药科技股份有限公司",
  "北京绿伞科技股份有限公司",
  "九曜汇聚（北京）企业管理咨询服务有限公司",
  "北京中消创安教育科技有限公司",
  "中职北方智扬（北京）教育科技有限公司",
  "京磁材料科技股份有限公司",
  "北京魔力耳朵科技有限公司",
  "北京七一八友益电子有限责任公司",
  "北京舟济科技有限公司",
  "北京天地精华教育科技有限公司",
  "北京亨瑞同照信息咨询有限公司",
  "北京妙医佳健康科技集团有限公司",
  "艺龙网信息技术（北京）有限公司",
  "北京酷车易美网络科技有限公司",
  "北京跟谁学科技有限公司",
  "北京中超伟业信息安全技术股份有限公司",
  "北京宝洁技术有限公司",
  "北京亿洋时代楼宇科技有限公司",
  "新华阳光科技发展集团有限公司",
  "北京江南博仁科技有限公司",
  "北京中科国金工程管理咨询有限公司",
  "北京凤凰天博网络技术有限公司",
  "丰桔出行（北京）科技有限公司",
  "北京海米汇科技有限公司",
  "北京蜜蜂汇金科技有限公司",
  "迪原创新（北京）科技有限公司",
  "北京晶川电子技术发展有限责任公司",
  "中关村国际医药检验认证科技有限公司",
  "北京阿奇夏米尔工业电子有限公司",
  "北京美宸信息咨询有限公司",
  "中能锐赫科技（北京）股份有限公司",
  "北京粉笔未来科技有限公司",
  "中咨工程管理咨询有限公司",
  "华辉安健（北京）生物科技有限公司",
  "北京长地万方科技有限公司",
  "网易传媒科技（北京）有限公司",
  "北京居业房地产咨询有限公司",
  "北京神州光大科技有限公司",
  "北京有竹居网络技术有限公司",
  "北京师大励耘教育科技发展集团有限公司",
  "北京世纪黄龙技术有限公司",
  "北京晓羊教育科技集团有限公司",
  "北京北旭电子材料有限公司",
  "北京中电高科工程技术有限公司",
  "北京谷安天下科技有限公司",
  "北京京运通科技股份有限公司",
  "北京卓越起点教育科技有限公司",
  "北京喵斯拉网络科技有限公司",
  "中国通用技术（集团）控股有限责任公司",
  "北京康得利智能科技有限公司",
  "北京国研数通软件技术有限公司",
  "北京英诺威尔科技股份有限公司",
  "北京盈禾优仕科技有限责任公司",
  "北京海博思创科技有限公司",
  "北京兴融信息技术有限公司",
  "卡尤迪生物科技（北京）有限公司",
  "北京益世美家电子商务有限公司",
  "北京长征天民高科技有限公司",
  "北京赛科希德科技股份有限公司",
  "北京灵图软件技术有限公司",
  "北京科原健康科技有限公司",
  "中万恩科技有限公司",
  "北京天地祥云科技有限公司",
  "北京大杰致远信息技术有限公司",
  "北京如易行科技有限公司",
  "北京迈道科技有限公司",
  "北京中石伟业科技股份有限公司",
  "招商新智科技有限公司",
  "北京绘本原创教育科技有限公司",
  "东方口岸科技有限公司",
  "当代绿建工程造价咨询（北京）有限公司",
  "新宇联安信息科技（北京）有限公司",
  "北京欣智恒科技股份有限公司",
  "北京中海通科技有限公司",
  "积水医疗科技（中国）有限公司",
  "中教智网（北京）信息技术有限公司",
  "他山集（北京）茶业科技有限公司",
  "北京首信科技股份有限公司",
  "同方泰德国际科技（北京）有限公司",
  "北京中税汇金智能科技有限公司",
  "中建电子信息技术有限公司",
  "北京微播跳动科技有限公司",
  "北京建恒信安科技有限公司",
  "北京曼德克环境科技有限公司",
  "北京天健源达科技股份有限公司",
  "北京汉王影研科技有限公司",
  "北京隆科兴科技集团股份有限公司",
  "爱美客技术发展股份有限公司",
  "中科朗智（北京）科技有限公司",
  "华云升达（北京）气象科技有限责任公司",
  "北京紫光数智科技股份有限公司",
  "北京旭日神州科技有限公司",
  "北京大岳咨询有限责任公司",
  "爱心灰姑娘（北京）国际教育科技有限公司",
  "中建材智慧工业科技有限公司",
  "北京赛惟咨询有限公司",
  "北京全式金生物技术有限公司",
  "北京美菜信息技术有限公司",
  "北京金水信息技术发展有限公司",
  "北京金水永利科技有限公司",
  "北京海葵科技有限公司",
  "北京东土军悦科技有限公司",
  "北京央视瑞安技术服务有限公司",
  "北京金自天正智能控制股份有限公司",
  "北京中祥英科技有限公司",
  "中国石油集团科学技术研究院有限公司",
  "北京瑞祺皓迪技术股份有限公司",
  "中茶网络科技（北京）有限公司",
  "北京屹唐半导体科技股份有限公司",
  "北京佳宸弘生物技术有限公司",
  "北京星选科技有限公司",
  "北京空管工程技术有限公司",
  "国能思达科技有限公司",
  "北京仁聚汇通信息科技有限责任公司",
  "北京才鼎通信息技术有限公司",
  "北京时空立方数字科技有限公司",
  "北京美鑫科技有限公司",
  "北京中烟信息技术有限公司",
  "北京尧地农业科技发展有限公司",
  "北京掌联智控科技有限公司",
  "北京光环致成国际管理咨询股份有限公司",
  "北京中熙正保远程教育技术有限公司",
  "北京德鑫泉物联网科技股份有限公司",
  "北京轩宇智能科技有限公司",
  "北京泰巨企业管理咨询有限公司",
  "北京安和加利尔科技有限公司",
  "北京蒙歌科技有限公司",
  "北京中科仙络咨询服务有限公司",
  "通用技术集团机床工程研究院有限公司",
  "优视科技有限公司",
  "中关村科技软件股份有限公司",
  "艾尼克斯电子（北京）有限公司",
  "北京方鸿智能科技有限公司",
  "北京筑梦园科技有限公司",
  "北京沐融信息科技股份有限公司",
];
module.exports = names;