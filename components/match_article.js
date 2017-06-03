var request = require("request");
var Slack = require('node-slack'); // Redirect all users query to slackbot, to see searching trends.

exports.match = function(query, callback) {
    /*
      Either cases, redirect user's query to slackbot channel.
     */
    var slack = new Slack("https://hooks.slack.com/services/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");
    var leading_info = "[From UT助手]: ";

    var input = query.split(/\s+/)[1]; 

    request.post('http://airloft.org/wordvec/', {form:{content: input}}, function (err, res, body) {

    	if('message' in JSON.parse(body)){
    		callback('小助手暂时没有合适的文章哦😭你的需求已经备案啦，我们会认真策划这方面的内容的~');
            extra_info = "没有匹配成功";
    	}
    	else{
    		callback([
	                {
	                    title: JSON.parse(body)["title"].trim(), // Remove leading and trailing space from string.
	                    url: JSON.parse(body)["url"]
	                }
	            ]);
	            extra_info = JSON.parse(body)["title"].trim();
	    	}
    	slack.send({
        	text: leading_info + query + " [INFO]: " + extra_info
    	});
        
    });

    // request.post('http://airloft.org/ada/', {form:{description: input}}, function (err, res, body) {
    //     if(body){
    //         var top_match_score = parseFloat(JSON.parse(body)["0"]["score"]).toFixed(3);
    //         var extra_info;
    //         if (JSON.parse(body)["0"]["url"] != "Unknown" && top_match_score > 0.016) {
    //             callback([
    //                 {
    //                     title: JSON.parse(body)["0"]["title"].trim(), // Remove leading and trailing space from string.
    //                     url: JSON.parse(body)["0"]["url"]
    //                 }
    //             ]);
    //             extra_info = JSON.parse(body)["0"]["title"].trim();
    //         }
    //         else {
    //             callback('小助手暂时没有合适的文章哦😭你的需求已经备案啦，我们会认真策划这方面的内容的~');
    //             extra_info = "没有匹配成功";
    //         }
    //         slack.send({
    //             text: leading_info + query + " [INFO]: " + extra_info
    //         });
    //     }
    //     else{
    //         callback('要多于四个字哦亲🙂️');
    //     }

    // });

};
