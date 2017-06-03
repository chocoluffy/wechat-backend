/**
 * Created by jyang on 2016-10-14.
 */

exports.handling = function (message, callback) {
    if (message.Event == 'subscribe') {
        var menu = [
            "time - 查询lecture, tutorial的时间教师安排, (比如: time csc108)",
            "where - 各大建筑物的位置, (比如: where ba)",
            "book - 各课程课本信息, (比如: book mat244)",
            "lib - 各大图书馆的开放时间, (比如: lib gerstein)",
            "亲 - 匹配小助手历史文章, (比如: 亲 美食)",
            "final - 查询期末考试时间, (比如: final csc108 csc165)"
        ];
        callback("你好呀~<(▰˘◡˘▰)>\n 目前支持的功能有: \n" + menu.join("\n"));
    }
    // } else if (message.Event == 'CLICK') {
    //     if (message.EventKey == 'gongnengjieshao') {
    //         var menu = [
    //             "time - 查询lecture, tutorial的时间教师安排, (比如: time csc108)",
    //             "where - 各大建筑物的位置, (比如: where ba)",
    //             "book - 各课程课本信息, (比如: book mat244)",
    //             "lib - 各大图书馆的开放时间, (比如: lib gerstein)",
    //             "亲 - 匹配小助手历史文章, (比如: 亲 美食)"
    //         ];
    //         callback("(▰˘◡˘▰) 你好呀~目前小助手支持的功能有: \n" + menu.join("\n"));
    //     }
    // }
};