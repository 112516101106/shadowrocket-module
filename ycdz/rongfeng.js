/*******************************

脚本功能：地震预警——解锁VIP
下载地址：https://is.gd/IMOX4I
软件版本：1.1.5
脚本作者：彭于晏💞
更新时间：2024-10—8
问题反馈：QQ+89996462
QQ会员群：779392027💞
TG反馈群：https://t.me/plus8889
TG频道群：https://t.me/py996
使用声明：此脚本仅供学习与交流，请勿转载与贩卖！⚠️⚠️⚠️

*******************************

[rewrite_local]

^http[s]?:\/\/app.rongfeng.work\/member\/earthIndex url script-response-body https://raw.githubusercontent.com/89996462/Quantumult-X/main/ycdz/rongfeng.js

[mitm] 

hostname = app.rongfeng.work

*******************************/

var body = $response.body.replace(/isForever":\d+/g,'isForever":1')
.replace(/isVIP":\d+/g,'isVIP":1')
$done({ body });
