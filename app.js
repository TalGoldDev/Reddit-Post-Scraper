const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

const start = async (redditPostID, subredditID) => {

    const SUBREDIT = subredditID;
    const POST = redditPostID;
    const BASE_URL = `https://old.reddit.com/r/${SUBREDIT}/comments/${POST}/?sort=top`;

  	console.log("Requesting Reddit Post Status: Beginning");

    let response = await request(
        BASE_URL,
        {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
            'cache-control': 'max-age=0',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
        }
    );

  	console.log("Requesting Reddit Post Status: Complete");
	console.log("");

    let $ = cheerio.load(response);

  	console.log("Scrapping Question Status: Beginning");

    //scraping the question\post
    let comments = [];
    let titleArray = [];
     $('#siteTable > .thing').each((i, elm) => {

     	let questionTitle = $(elm).find('.title > a').text().trim()

     	let subReddit = $(elm).find('.domain > a').text().trim()
     	subReddit = subReddit.substring(5);

     	let postOwner = $(elm).find('.tagline > a').text().trim()
     	let postTime = $(elm).find('.tagline > time').text().trim()


     	let commentsAmount = $(elm).find('.flat-list.buttons > li.first').text().trim()
		var res = commentsAmount.split(" ");
    	commentsAmount = res[0];
		var x = Number(commentsAmount);
		commentsAmount = m(x,1);

     	let questionUpvotes = $(elm).find('.midcol.unvoted > .score.unvoted').text().trim()

     	comments.push({
     		questionTitle,
            subReddit,
            postTime,
            postOwner,
            commentsAmount,
			questionUpvotes
     	});
     })

  	console.log("Scrapping Question Status: Complete");
	console.log("");



     //scraping comments.
  	console.log("Scrapping Comments Status: Beginning");

     var commentArea = `#siteTable_t3_${POST}`;
     $(`${commentArea} > .thing`).each((i, elm) => {

        let comment = $(elm).find('.entry > form > .usertext-body').text().trim();
		var res = comment.split("\n\n");
    	var mainComment = res[0];

        let entirePoints = $(elm).find('.entry.unvoted > p > .score.unvoted').text().trim();
        var res = entirePoints.split("s");
    	var commentPoints = res[0] + "s";

        let commentPostTime = $(elm).find('.entry.unvoted > p > time').text().trim();
        var res = commentPostTime.split("ago");
    	var commentTime = res[0] + "ago";

        var commentPoster = $(elm).find('.entry > p').text().trim();
        var res = commentPoster.split(" ");
    	commentPoster = res[0];
    	commentPoster = commentPoster.substring(3);

        comments.push({
            mainComment,
            commentPoints,
            commentTime,
            commentPoster
        });
    })

	console.log("Scrapping Comments Status: Complete");
	console.log("");


	let finalComments = processComments(comments);


    saveToFile(finalComments,redditPostID);
}

function m(n,d){
	x=(''+n).length;
	p=Math.pow;
	d=p(10,d);
	x-=x%3;
	return Math.round(n*d/p(10,x))/d+" kMGTPE"[x/3]
}

function processComments(comments){
	console.log("Processing Comments Status: Beginning");

	filteredCommentsArray = [];

	comments.forEach((item, index) =>{

		var currentComment = item;

		 if (index < 1) {
		 	filteredCommentsArray.push(currentComment)
		 	return;
		 };

		//removing low quallity comments.
		if(currentComment.mainComment.length <= 1 || currentComment.mainComment === null){
			return;
		}

		var currentCommentText = currentComment.mainComment;
		var currentCommentPoints = currentComment.commentPoints;
		var currentCommentTime = currentComment.commentTime;
		var currentCommentPoster = currentComment.commentPoster;

		filteredCommentsArray.push({
			commentText: currentCommentText,
			commentPoints: currentCommentPoints,
            commentTime: currentCommentTime,
            commentPoster: currentCommentPoster
		});

		});

	console.log("Processing Comments Status: Complete");
	console.log("");

	return filteredCommentsArray;

}

function saveToFile(comments, redditPostID){

	console.log("Saving To File Status: Beginning");

	fs.writeFile(

	    `./comments/${redditPostID}.json`,

	    JSON.stringify(comments),

	    function (err) {
	        if (err) {
	            console.error('Crap happens');
	        }
	    }
	);

	console.log("Saving To File Status: Complete");
	console.log("");

	console.log(`Files Saved To /comments/${redditPostID}.json`);
	console.log("");

}


function processURL(providedURL){

	console.log("Processing Reddit Post URL: Beginning");

	//example of an URL
	//https://old.reddit.com/r/AskReddit/comments/bl2scw/what_screams_im_not_a_good_person/?sort=top
	var str = providedURL;

  	var res = str.split("/");

	console.log("Processing Reddit Post URL: Complete");
	console.log("");

  	return [res[6],res[4]];
}




//main starts here
console.log("");

let [redditPostID,subredditID] = processURL(process.argv[2]);

start(redditPostID, subredditID);
