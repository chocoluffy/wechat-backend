/**
 * Created by jyang on 2016-08-15.
 根据用户搜索匹配，根据词的不同call function
 */
var utschedule = require("./components/utschedule");
var opentime = require("./components/opentime");
// var bot = require("./components/chatbot");
var match_article = require("./components/match_article");
var chatterbot = require("./components/chatterbot");
// var chatbot = require("./components/chatbot");

var SPECIAL_WORDS = {
   "苟利国家生死以": "岂因祸福避趋之",
   "岂": "岂因祸福避趋之",
   "苟利": "祸福",
   "苟": "苟利国家生死以",
   "狗": "汪",
   "ada娘": "诶"
}

var MENU = [
    "time - 查询lecture, tutorial的时间教师安排, (比如: time csc108)",
    "where - 各大建筑物的位置, (比如: where ba)",
    "book - 各课程课本信息, (比如: book mat244)",
    "lib - 各大图书馆的开放时间, (比如: lib gerstein)",
    "亲 - 匹配小助手历史文章, (比如: 亲 美食)"
];

/*
  Main if-else function block. Forward different demands to corresponding component files under components/ directory.
 */
exports.matching = function (query, callback) {

    console.log("DEBUG: 以下内容刚刚被输入: " + query);

    var words = query.split(/\s+/);
    // TODO .toLowerCase()

    // var pattern = new RegExp(words);

    if (words[0].trim() in SPECIAL_WORDS) {
        callback(SPECIAL_WORDS[words]);
    }

    // FINAL EXAM SCHEDULE 期末考时间表
    else if (words[0] == 'final' || words[0] == 'exam') {
        utschedule.exam(query, callback);
    }

    // TIMETABLE 时间表
    else if (words[0] == 'time' || words[0] == 'timetable' || words[0] == 'calendar' ||
     words[0] == 'cal' || words[0] == 'des' || words[0] == 'description') {
         if (words.length == 1) {
             callback("命令没有输全。格式: <命令> <课程代码>，例子：time csc108");
         }
        utschedule.timetable(query, callback);
    }

    // else if (words[0] == 'calendar' || words[0] == 'cal' || words[0] == 'des' || words[0] == 'description') {
    //     utschedule.calendar(query, callback);
    // }

    // COURSES 课程介绍
    else if (words[0].match('[a-zA-Z][a-zA-Z][a-zA-Z][0-9][0-9][0-9]')) {
        callback('"final ' + words[0] + '" for final exam\n' + '"time ' + words[0] + '" for course time\n' + '"des ' + words[0] + '" for course description\n');
    }

    // LOCATION 教室地点
    else if (words[0] == 'where' || words[0] == 'loc' || words[0] == 'location' || words[0] == '找'){
        utschedule.location(query, callback);
    }

    // ARTICLES 文章
    else if (words[0] == '亲' || words[0] == '親' || words[0] == '文章' || words[0] == 'article') {
        match_article.match(query, callback);
    }

    // TEXTBOOK 教材
    else if (words[0] == 'book' || words[0] == 'textbook' || words[0] == '課本' || words[0] == '教科書' || words[0] == '書' || words[0] == '课本' || words[0] == '教科书' || words[0] == '书') {
        utschedule.textbook(query, callback);
    }

    // FOOD 食物
    // else if (words[0] == 'food') {
    //     utschedule.food(query, callback);
    // }

    // Library 图书馆
    else if (words[0] == 'lib' || words[0] == 'library' || words[0] == '图书馆' || words[0] == '圖書館') {
        opentime.library(query, callback);
    }

    /*
      Use chatterbot api.
     */
    else {
        // chatterbot.chat(query, callback);
    }


    // HAVE NOT BEEN IMPLEMENTED 功能尚未实现
    // else {
    //     chatbot.chat_bot(query, callback);
    // }

    /*
      Return back functionality menu.
     */
    // else {
    //     callback("(▰˘◡˘▰) 你好呀~目前小助手支持的功能有: \n" + MENU.join("\n"));
    // }

};
