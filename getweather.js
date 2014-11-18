var request = require('request');
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'PUT_YOUR_CONSUMER_KEY_HERE',
    consumerSecret: 'PUT_YOUR_CONSUMER_SECRET_HERE'
});
var accessToken = "PUT_YOUR_ACCESS_TOKEN_HERE";
var accessTokenSecret ="PUT_YOUR_ACCESS_TOKEN_SECRET_HERE";

// configure the request
var options = {
	url: 'https://api.forecast.io/forecast/885b6e5cd42ff19b9e2938503ab75c4b/40.7056,-73.978',
	method: 'GET'
};

// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {

		var weather = JSON.parse(body);

		console.log(weather);
		
		var rain_chance = weather.daily.data[0].precipProbability;
		
		console.log(rain_chance);
		
		if (rain_chance > 0.5){
			console.log("Bring your umbrella!");
		} else {
			console.log("No umbrella needed!");
		}
		
		twitter.statuses("update", {
		        status: "Tweet test."
		    },
		    accessToken,
		    accessTokenSecret,
		    function(error, data, response) {
		        if (error) {
		            // something went wrong
		        } else {
		            // data contains the data sent by twitter
		        }
		    }
		);
		
		
    } else {
        console.log(error);
    }
});
