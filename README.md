# Reddit-Post-Scraper
content scraper written in Javascript for Reddit. Grab all of the top comments & content of a given reddit post.

# How To Use The Program
Run the program and pass the redditPostID, subredditID of a reddit post using command line arguments.
the program will request and processes the web page using the old reddit web page

BASE_URL = `https://old.reddit.com/r/${SUBREDIT}/comments/${POST}/?sort=top`;

the base url requests the reddit post sorted by top, which can be changed to any other sorting method (relevance,etc...)

using cheerio to load the response of the request, processing each post and comment received in the request.
