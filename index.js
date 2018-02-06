
var linebot = require('linebot');
var express = require('express');
var cheerio = require("cheerio");
var getJSON = require('get-json');
var request = require("request");

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
	channelSecret: process.env.CHANNEL_SECRET,
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

var timer, timer2;
var pm = [];
var us, hk, gb, jp, eu, cn;
var us_dollar, us_dollars;
var gb_dollar, gb_dollars;
var hk_dollar, hk_dollars;
var jp_dollar, jp_dollars;
var eu_dollar, eu_dollars;
var cn_dollar, cn_dollars;
_getJSON();
_getMoney();
_bot();
const app = express();
const linebotParser = bot.parser();
app.post('/linewebhook', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});

function _bot() {
  bot.on('message', function(event) {
    if (event.message.type == 'text') {
      var msg = event.message.text;
      var replyMsg = '';
      var us_dollar = msg.substring(4, 10);
      var gb_dollar = msg.substring(4, 10);
      var hk_dollar = msg.substring(4, 10);
      var jp_dollar = msg.substring(4, 10);
      var eu_dollar = msg.substring(4, 10);
      var cn_dollar = msg.substring(4, 10);
      if (msg.indexOf('PM2.5') != -1) {
        pm.forEach(function(e, i) {
          if (msg.indexOf(e[0]) != -1) {
						replyMsg = e[0] + '的 PM2.5 數值為 ' + e[1] +
						'\n狀態：' + e[3];
          }
        });
        if (replyMsg == '') {
          replyMsg = '請輸入正確的地點';
        } 
      }
      
      if(msg.indexOf('@us') != -1){
        replyMsg = '美金低於 '+ us_dollar + ' 會通知您';
      }
      if(msg.indexOf('美金') != -1)
			{
				replyMsg = '現在美金匯率為：' + us;
      }
      if(msg.indexOf('@hk') != -1){
        replyMsg = '港幣低於 '+ hk_dollar + ' 會通知您';
      }
			if(msg.indexOf('港幣') != -1)
			{
				replyMsg = '現在港幣匯率為：' + hk;
      }
      if(msg.indexOf('@gb') != -1){
        replyMsg = '英鎊低於 '+ gb_dollar + ' 會通知您';
      }
      if(msg.indexOf('英鎊') != -1)
			{
				replyMsg = '現在英鎊匯率為：' + gb;
      }
      if(msg.indexOf('@jp') != -1){
        replyMsg = '日幣低於 '+ jp_dollar + ' 會通知您';
      }
      if(msg.indexOf('日幣') != -1)
			{
				replyMsg = '現在日幣匯率為：' + jp;
      }
      if(msg.indexOf('@eu') != -1){
        replyMsg = '歐元低於 '+ eu_dollar + ' 會通知您';
      }
      if(msg.indexOf('歐元') != -1)
			{
				replyMsg = '現在歐元匯率為：' + eu;
      }
      if(msg.indexOf('@cn') != -1){
        replyMsg = '人民幣低於 '+ cn_dollar + ' 會通知您';
      }
      if(msg.indexOf('人民幣') != -1){
        replyMsg = '現在人民幣匯率為：' + cn;
      }
      
      us_dollars = us_dollar;
      gb_dollars = gb_dollar;
      hk_dollars = hk_dollar;
      jp_dollars = jp_dollar;
      eu_dollars = eu_dollar;
      cn_dollars = cn_dollar;
      // if (replyMsg == '') {
      //   replyMsg = '不知道「'+ msg +'」是什麼意思 ︿︿';
      // }
      event.reply(replyMsg).then(function(data) {
        console.log(replyMsg);
      }).catch(function(error) {
        console.log('error');
      });
    }
  });

}

function _getJSON() {
  clearTimeout(timer);
  getJSON('http://opendata2.epa.gov.tw/AQX.json', function(error, response) {
    response.forEach(function(e, i) {
      pm[i] = [];
      pm[i][0] = e.SiteName;
      pm[i][1] = e['PM2.5'] * 1;
			pm[i][2] = e.PM10 * 1;
      pm[i][3] = e['Status'];
      
      if (e[1] > 5){
        bot.push('Ud587af9ef7efbcdce047f367bad6e605', e[0] + '的PM2.5過高');
      } 
    });
  });
  timer = setInterval(_getJSON, 1800000); //每半小時抓取一次新資料
}

function _getMoney() {
  clearTimeout(timer2);
  request({
    url: "http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm",
    method: "GET"
  }, function(error, response, body) {
    if (error || !body) {
      return;
    } else {
      var $ = cheerio.load(body);
      var target = $(".rate-content-sight.text-right.print_hide");
      console.log(target[1].children[0].data);
      console.log(target[3].children[0].data);
      console.log(target[5].children[0].data);
      console.log(target[15].children[0].data);
      console.log(target[29].children[0].data);
      console.log(target[37].children[0].data);
      us = target[1].children[0].data;
      hk = target[3].children[0].data;
      gb = target[5].children[0].data;
      jp = target[15].children[0].data;
      eu = target[29].children[0].data;
      cn = target[37].children[0].data;
      
      if (us < us_dollars) {
        bot.push('Ud587af9ef7efbcdce047f367bad6e605', '現在美金 ' + us +' 低於您所設定的 '+ us_dollars +' ，可以下手囉！');
      }
      if (hk < hk_dollars) {
        bot.push('Ud587af9ef7efbcdce047f367bad6e605', '現在港幣 ' + hk +' 低於您所設定的 '+ hk_dollars +' ，可以下手囉！');
      }
      if (gb < gb_dollars) {
        bot.push('Ud587af9ef7efbcdce047f367bad6e605', '現在英鎊 ' + gb +' 低於您所設定的 '+ gb_dollars +' ，可以下手囉！');
      }
      if (jp < jp_dollars) {
        bot.push('Ud587af9ef7efbcdce047f367bad6e605', '現在日幣 ' + jp +' 低於您所設定的 '+ jp_dollars +' ，可以下手囉！');
      }
      if (eu < eu_dollars) {
        bot.push('Ud587af9ef7efbcdce047f367bad6e605', '現在歐元 ' + eu +' 低於您所設定的 '+ eu_dollars +' ，可以下手囉！');
      }
      if (cn < cn_dollars) {
        bot.push('Ud587af9ef7efbcdce047f367bad6e605', '現在人民幣 ' + cn +' 低於您所設定的 '+ cn_dollars +' ，可以下手囉！');
      }

      console.log(jp_dollars);
      timer2 = setInterval(_getMoney, 3600000);
    }
  });
}
