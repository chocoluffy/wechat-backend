var request = require("request");
var GoogleURL = require('google-url');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var db_url =  "mongodb://utzhushou:ada23333@ds019836.mlab.com:19836/utzhushou";
var googleUrl = new GoogleURL( { key: 'AIzaSyBZx4GANyssAEQdVlG2XuSeY-8vUsxRkBw' });

/*
    Credentials. Not used when the API is down.
 */
var key = '71VOkMkO2wya3z8ZQ315yUd243xYWIda'; // the authentication key for requests.
var limit = '100';

var cheerio = require('cheerio');
var URL_BASE = 'http://www.artsci.utoronto.ca/current/exams/apr17';
var options = {
  url: URL_BASE,
  headers: {
    'User-Agent': 'request'
    // need a user agent to scrape page correctly.
  }
};

function get_final(query, cb) {
    request(options, function (error, response, html) {
        result = ""
        if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var libLst = {};

        $('table.listing tr').each(function(i, element){
            var code = $(this).children('td').first().text().trim();
            code = code.substring(0,6).toLowerCase();
            var section = $(this).children('td').first().next().text().trim();
            var date = $(this).children('td').first().next().next().text().trim();
            var time = $(this).children('td').first().next().next().next().text().trim();
            var location = $(this).children('td').first().next().next().next().next().text().trim();
            if (section == '') {
                section = 'ALL'
            }
            if (libLst[code] == undefined) {
                libLst[code] = {};
            }
            libLst[code][section] = {
                "date": date,
                "time": time,
                "location": location,
            };
        });
        };
        var codeIds = query.split(/\s+/);
        codeIds.shift();

        for (var j = 0; j < codeIds.length; j ++) {
            codeId = codeIds[j];
            courseInfo = libLst[codeId.substring(0, 6).toLowerCase()]

            result += "课程名: " + codeId.toUpperCase() + "\n";
            if (courseInfo != undefined) {
                num_section = Object.keys(courseInfo).length
                if (num_section > 1) {
                    result += "这节课有" + num_section + "个考场：" + "\n"
                }
                for (section in courseInfo) {
                    if (num_section > 1) {
                        result += "部分: " + section + "\n"
                    }
                    result += "日期: " + courseInfo[section]["date"] + "\n";
                    result += "时间: " + courseInfo[section]["time"] + "\n";
                    result += "地点: " + courseInfo[section]["location"] + "\n\n";
                }
            }
            else { // If not found
                result += "这门课没有期末考试或者这节课不存在\n\n"
            }
            result += "========\n\n"
        }

        result += "官方链接：" + "https://goo.gl/lDpH47"
        cb(result); // # See line 14
    });
}


exports.exam = function(query, callback) {
    get_final(query, callback);
};
/*
    Independent functions can be written in seperate files. ans use `require()` to import.
 */
// export default exam = function(query, callback) {
//     callback('final exam timetable is not posted yet.');
// };

exports.timetable = function(query, callback) {
    var prefix = query.split(/\s+/)[0];
    var codeId = query.split(/\s+/)[1]; // e.g. query = 'time csc148', then code = 'csc148'
    var sectionId = '';
    if (query.split(/\s+/)[2] != undefined) {
      sectionId = query.split(/\s+/)[2];
      sectionId = sectionId.toUpperCase();
    }
    codeId = codeId.toUpperCase();
    var result = "";
    var sectionResult = "";
    // Use connect method to connect to the server
    MongoClient.connect(db_url, function(err, db) {

        // Get the documents collection
        var collection = db.collection("new_courses");
        if (err) console.log(err);
        // Find some documents
        collection.find({'code': {$regex:codeId}}).toArray(function(err, docs) { // SEARCH THE DATABASE ACCORDING TO THE USER INPUT
          if (err) console.log(err);
          if (docs.length > 50) { // 输入内容太少导致匹配结果太多
            result = "有太多匹配结果啦\nヽ(`Д´)ﾉ ┻━┻试试看精确点？";
            callback(result);
          } else {
            if (docs.length == 0) { // 输入内容完整但内容不对导致没有匹配结果
              result = "抱歉 m(._.)m，未能找到对应的课程，试试输入别的？";
              callback(result);
            } else { // 有匹配结果
              if (codeId.length < 6) { // Doesn't give a full course code, but it contains less than 10 matches
                result = "似乎课程没输全？我们帮你找了找相关课程 (*^_^*)\n";
                  courseList = [];
                for (var i = 0; i < docs.length; i ++) {
                  var courseCode = JSON.stringify(docs[i].code).substring(1,7) + '\n';
                  if (courseList.indexOf(courseCode) <= -1) { // The course is not in the list yet， avoid repetation
                    courseList.push(courseCode);
                  }
                }
                for (var j = 0; j < courseList.length; j++) {
                  result += courseList[j].toString();
                }
                callback(result);
              } else { // Give a full course code
                  result = "";
                  sectionResult = '';
                  var space = '\n';
                  if (prefix == 'time' || prefix == 'timetable')  { //要查time的情况
                    for (var j = 0; j < docs.length; j ++) {
                        var courseCode = delete_quote(JSON.stringify(docs[j].code)) + '有以下几个sections:';
                        result += courseCode + space + space;
                        //var courseName = "Name: " + delete_quote(JSON.stringify(docs[j].name)); courseName不重要，暂时省略
                        // 直接用了0导致无法区分sections
                        for (var k = 0; k < docs[j].meeting_sections.length; k++) {
                          var courseSection = "Section " + delete_quote(JSON.stringify(docs[j].meeting_sections[k].code));
                          var courseInstr = "教授：" + delete_quote(JSON.stringify(docs[j].meeting_sections[k].instructors));

                          if (sectionId == delete_quote(JSON.stringify(docs[j].meeting_sections[k].code))) {
                            sectionResult += courseSection + space + courseInstr + space;
                          }
                          result += courseSection + space;

                          if (courseInstr.length > 6){
                            result += courseInstr + space;
                          }
                          for (var i = 0; i < docs[j].meeting_sections[k].times.length; i++) {
                            var courseTime = "  时间：" + short_time_abbrev(docs[j].meeting_sections[k].times[i]);
                            var courseLoc = "  地点：" + delete_quote(JSON.stringify(docs[j].meeting_sections[k].times[i].location));
                            if (courseTime.length > 4){
                              result += courseTime + space;
                            }
                            if (courseTime.length > 4){
                              result += courseLoc + space;
                            }

                            if (sectionId == delete_quote(JSON.stringify(docs[j].meeting_sections[k].code))) {

                              sectionResult += courseTime + space + courseLoc+ space;
                            }
                          }
                          result += space;
                        }
                    }
                    result += '输入 where 教学楼名称(e.g. where BA) 还可以查询教学楼位置哦（≧∇≦）！';

                    if (result.length > 1000 && codeId.length >6){ // 说详细了但还是太多
                      result = '恭喜你查的课是多大最热门的几门课，即使输入了完整代码，小助手得到的信息还是太多了(无奈)，不如再说说具体的Sections吧(e.g.: AST101H1F L0101)？。'
                    }
                    if (result.length > 1000) {
                      result = '哇，这门课似乎非常热门，有太多内容啦，小助手无法一次告诉你全部信息(╥﹏╥)，能不能说详细点呀(e.g.: CSC108H1F)';
                    }
                    if (sectionId.length > 0) {
                      result = sectionResult + space + '输入 where 教学楼名称(e.g. where BA) 还可以查询教学楼位置哦（≧∇≦）！';
                    }
                    callback(result);
                  } else { // 要查des的情况
                    var courseCode = "Code: " + delete_quote(JSON.stringify(docs[0].code));
                    var courseName = "Name: " + delete_quote(JSON.stringify(docs[0].name));
                    var courseDes = "Description: " + delete_quote(JSON.stringify(docs[0].description));
                    var pre = "";
                    if (delete_quote(JSON.stringify(docs[0].prerequisites)) == ""){
                      pre = "None";
                    } else {
                      pre = delete_quote(JSON.stringify(docs[0].prerequisites));
                    }
                    var coursePre = "Prerequisites: " + pre;
                    var exc = "";
                    if (delete_quote(JSON.stringify(docs[0].exclusions)) == ""){
                      exc = "None";
                    } else {
                      exc = delete_quote(JSON.stringify(docs[0].exclusions));
                    }
                    var courseExc = "Exclusions: " + exc;
                    var single_item = courseCode + space + courseName + space + space + courseDes +
                    space + space + coursePre + space + courseExc;
                    result += single_item;
                    callback(result);
                  }
              }
            }
          }
        db.close();
        });
    });
};
    // request(request_url, function(error, response, body) {
    //     var result = JSON.parse(body);
    //     if (result && result.length > 0) { //if the result is not empty, then we find the course
    //         if (code.length >= 6) { // if user gives the full course code
    //             var result_string = '';
    //             for (i = 0; i < result.length; i++) { // for each semester
    //                 result_string += '---------' + '\n';
    //                 result_string += 'Code: ' + result[i]['code'] + '\n' + 'Name: ' + result[i]['name'] + '\n\n';
    //
    //                 result[i]['meeting_sections'] = result[i]['meeting_sections'].sort(function(a,b) {return (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0);} ); // sort the meeting sections by their section code
    //                 for (j = 0; j < result[i]['meeting_sections'].length; j++) { // for each section
    //                     result_string += 'Section: ' + result[i]['meeting_sections'][j]['code'] + '\n' + 'Time: ';
    //                     result_string += time_to_abbrev(result[i]['meeting_sections'][j]['times']);
    //
    //                     result_string += '\nInstructors:' + result[i]['meeting_sections'][j]['instructors'];
    //                     result_string += '\n\n';
    //                 }
    //             }
    //             callback(result_string);
    //         } else { // if the user gives partial course code
    //             var course_codes = [];
    //             for (i = 0; i<result.length; i++) {
    //                 course_codes.push(result[i]['code']);
    //             }
    //             callback(course_codes.join(',  ')); // return a list of course codes only.
    //         }
    //     } else {
    //         callback('cannot find course ' + code);
    //     }
    // });


// exports.calendar = function(query, callback) {
//     var code = query.split(/\s+/)[1];
//     code = code.toUpperCase(); // e.g. query = 'des csc148', then code = 'CSC148'
//
//     MongoClient.connect(db_url, function(err, db) {
//
//       var collection = db.connection("courses");
//       if (err) console.log(err);
//
//       collection.find({}).toArray(function(err, docs) {
//         if (err) console.log(err);
//         if (docs.length < 50) {
//           var result =
//         }
//       });
//     });
//
//     request(request_url, function(error, response, body) {
//         var result = JSON.parse(body);
//         if (result && result.length > 0) { // if the result is not empty, then we find the course
//             if (code.length >= 6) { // if user gives the full course code
//                 var result_string = 'Code: ' + result[0]['code'].slice(0, 6) + '\n' + 'Name:' + result[0]['name'] + '\n' + 'Description:' + result[0]['description'] + '\n'
//                     + 'Prerequisites: ' + result[0]['prerequisites'] + '\n' + 'Exclusions: ' + result[0]['exclusions'] + '\n';
//                 callback(result_string);
//             } else { // if the user gives partial course code
//                 var course_codes = new Set();
//                 for (i = 0; i<result.length; i++) {
//                     course_codes.add(result[i]['code'].slice(0, 6));
//                 }
//                 callback(Array.from(course_codes).join(', ')); // return a list of course codes only.
//             }
//         } else {
//             callback('cannot find course ' + code);
//         }
//     });
// };


exports.textbook = function(query, callback) {

    var split = query.split(/\s+/);
    var course_id = split[1];
    if (split.length == 1) {
        callback("你要找哪节课的课本呢？");
    } else {
        var request_url = 'https://cobalt.qas.im/api/1.0/textbooks/filter?q=course_code:' + course_id + '&key=' + key;
        // callback(request_url);
        request(request_url, function(error, response, body) {
            var result = JSON.parse(body);

            // if the result is not empty, then we find the course
            if (result && result.length > 0) {

                callback(result[0]['title'] + ": " + result[0]['url']);

                // TODO IT SOMETIMES DOES NOT WORK. E.G. CSC108, CSC148
                // TODO IF THERE ARE MORE THAN ONE TEXTBOOK FOR THE COURSE, IT MIGHT ONLY SHOW THE FIRST ONE.
                // TODO IF DIFFERENT SESSIONS USE DIFFERENT TEXTBOOK, IT MIGHT ONLY SHOW THE FIRST ONE. E.G. ECO100Y1Y
            } else {
                callback('未找到任何数据，可能性有\n1.该课程不存在\n2. 该课程所需要的课本尚未发布\n3.该课程不需要课本');
            }
        });
    }
};

exports.food = function(query, callback) {

    var split = query.split(/\s+/);
    var course_id = split[1];
    if (split.length == 1) {
        callback("你要找哪节课的课本呢？");
    } else {
        var request_url = 'https://cobalt.qas.im/api/1.0/food/filter?q=course_code:' + course_id + '&key=' + key;
        // callback(request_url);
        request(request_url, function(error, response, body) {
            var result = JSON.parse(body);

            // if the result is not empty, then we find the course
            if (result && result.length > 0) {

                callback(result[0]['title'] + ": " + result[0]['url']);

                // TODO IT SOMETIMES DOES NOT WORK. E.G. CSC108, CSC148
                // TODO IF THERE ARE MORE THAN ONE TEXTBOOK FOR THE COURSE, IT MIGHT ONLY SHOW THE FIRST ONE.
                // TODO IF DIFFERENT SESSIONS USE DIFFERENT TEXTBOOK, IT MIGHT ONLY SHOW THE FIRST ONE. E.G. ECO100Y1Y
            } else {
                callback('未找到任何数据，可能性有\n1.该课程不存在\n2. 该课程所需要的课本尚未发布\n3.该课程不需要课本');
            }
        });
    }
};

exports.location = function(query, callback) {

    var split = query.split(/\s+/);
    var loc = split[1];
    if (split.length == 1) {
        callback("你要找哪栋建筑呢？");
    } else {

        loc = loc.toUpperCase();
            // e.g. query = 'where BA', then loc = 'BA'
        MongoClient.connect(db_url, function(err, db) {
            var collection = db.collection("buildings");
            if (err) console.log(err);
            collection.find({'code': {$regex: loc}}).toArray(function(err, docs) {
                if (err) console.log(err);
                if (docs && docs.length > 0) { // if the result is not empty, then we find the location
                    var longURL = 'http://maps.google.com?q=' + JSON.stringify(docs[0].lat) + ',' + JSON.stringify(docs[0].lng);
                    googleUrl.shorten(longURL, function( err, shortUrl ) {
                      callback(JSON.stringify(docs[0].short_name) + ': ' + shortUrl);
                    } );
                } else {
                    callback('找不到所对应的建筑。');
                }

                db.close();
            });
        });
    }

    // if (code.length == 2) { // if user gives short code like BA, SS
        // request_url = 'https://cobalt.qas.im/api/1.0/buildings/filter?key=' + key + '&limit=' + limit + '&q=code:%22' + code + '%22';
    // } else {
        // request_url = 'https://cobalt.qas.im/api/1.0/buildings/filter?key=' + key + '&limit=' + limit + '&q=name:%22' + code + '%22';
    // }
    // request(request_url, function(error, response, body) {
    //     var result = JSON.parse(body);
    //     if (result && result.length > 0) { // if the result is not empty, then we find the location
    //         callback(result[0]['short_name'] + ': ' + 'http://maps.google.com?q=' + result[0]['lat'] + ',' + result[0]['lng']);
    //     } else {
    //         callback('cannot find location ' + code);
    //     }
    // });
};

var dict = {'MONDAY':1, 'TUESDAY':2, 'WEDNESDAY':3, 'THURSDAY':4, 'FRIDAY':5};
var dict2 = {'MONDAY':'M', 'TUESDAY':'T', 'WEDNESDAY':'W', 'THURSDAY':'R', 'FRIDAY':'F'};

var short_time_abbrev = function(time_objects) { // input: {"day":"FRIDAY","start":36000,"end":39600,"duration":3600,"location":"WB 116"}, output: 'F10-11'
  var output = '';
  //var sorted_time_objects = time_objects.sort(function(a,b) {return (dict[a.day] > dict[b.day]) ? 1 : ((dict[b.day] > dict[a.day]) ? -1 : 0);} );

  var start_time = parseInt(time_objects['start']) / 3600; // parseInt change string to int
  if (start_time >= 13) {
    start_time -= 12;
  }

  var end_time = parseInt(time_objects['end']) / 3600; // parseInt change string to int
  if (end_time >= 13) {
    end_time -= 12;
  }
  output = output + dict2[time_objects.day] + start_time + '-' + end_time + ' ';
  return output;
};

var time_to_abbrev = function(time_objects) {
    /* e.g. input: [{"day":"THURSDAY","start":46800,"end":54000,"duration":7200}, {"day":"WEDNESDAY","start":46800,"end":54000,"duration":7200}] // this format is provided by UofT API
     *       output: 'W1-3 R1-3' // this is the desired format
     * */
    var output = '';
      var sorted_time_objects = time_objects.sort(function(a,b) {return (dict[a.day] > dict[b.day]) ? 1 : ((dict[b.day] > dict[a.day]) ? -1 : 0);} );

    for (k = 0; k < sorted_time_objects.length; k++) {
        var start_time = parseInt(sorted_time_objects[k]['start']) / 3600;
        if (start_time >= 13) {
            start_time -= 12;
        }

        var end_time = parseInt(sorted_time_objects[k]['end']) / 3600;
        if (end_time >= 13) {
            end_time -= 12;
        }
        output = output + dict2[sorted_time_objects[k].day] + start_time + '-' + end_time + ' ';
    }
    return output;
};

var delete_quote = function(quote_string) { // input: "abc"; output: abc
  var result = "";
  var quote = "\"";
  if (quote_string.indexOf(quote) > -1) {
    result = quote_string.substring(quote_string.indexOf(quote)+1, quote_string.lastIndexOf(quote));
    return result;
  } else {
    return quote_string;
  }

};
