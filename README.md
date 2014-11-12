#Computing in the Cloud

First a quick discussion about EC2 v S3.

**S3** holds static files, such as html and js files. If you use it as a web hosting place, which is common, you just want to make sure all the files are public.

So that poses a problem when you have API keys!

**EC2** is a live computer where you can run programs -- including programs that use your API keys. 

##Fire Up Your Cloud Computer

- go to [http://aws.amazon.com](http://aws.amazon.com)
- Sign up with your Amazon account
- What we want is your AWS Management Console
- If you don't see "N. Virginia" next to your name, change it to that
- Pick EC2
- Launch an instance!
- Pick Ubuntu
- pick the t2.micro (it's free for a year!)
- Leave all of the configuration details as is, click Next ...
- Leave the storage details as is, click Next ...
- Opposite the "name" box, put in a name for your computer. Like `My First Cloud Computer`, click next ...
- Despite the warning, leave security group things as is (This is not the best practice, but more on that in class)
- Click `Review and Launch`
- Click `Launch`
- Change the next menu to "Create a New Key Pair"
- You'll get a file downloaded. Put that on your desktop. You'll need it in a bit.

Great! Before you continue, we have to fix something on that key you just downloaded to give it the right permissions.

Open your Terminal program. Type:

    chmod 400 [path to pem file]

Need to grab the key and put it in our hand

    ssh-add [path to pem file]
    
##Log into your new computer and set things up!

Now we can log in. You get the IP address by clicking on the EC2 instance in your Amazon console at aws.amazon.com:

    ssh ubuntu@<ip address of instance>
        
You in? If so, there are some things we need to install, including "node" and the node package manager, "npm"

    sudo apt-get update
    sudo apt-get install nodejs
    sudo apt-get-install npm
    sudo ln -s /usr/bin/nodejs /usr/bin/node

Finally, we're using some pre-programmed javascript to include.

    npm install request
    
Great! Now we're ready to write our program. Start up the text editor using `pico` but also include the file name we want to make and edit, `getweather.js`

    pico getweather.js
    
##Write our program

Now, let's build the "node" version of our weather app from last week (without the charts, tho).

    var request = require('request');

we're going to set up the request:

    var options = {
    	url: 'https://api.forecast.io/forecast/885b6e5cd42ff19b9e2938503ab75c4b/40.7056,-73.978',
    	method: 'GET'
    };
    
OK! Now we need to set up the code to get the weather data.

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            // this is what runs if/when the API call works
            // so put all the rest of the code below here
    		var weather = JSON.parse(body);
    		
    		console.log(weather);
    		
    		
    		
    		// ... and above here
    	} else {
            console.log(error);
        }
    });
    		
In a new tab, log into the Amazon instance again ... 

    ssh ubuntu@<ip address of instance>

... and run the script:

    node getweather.js

Did it work?
    		
Now let's go get the upcoming day's precipitation, which is under the "daily" part of the data. Here's the full tree ...

    		var rain_chance = weather.daily.data[0].precipProbability;

    		console.log(rain_chance);
    		
Now let's make some conditional. Do we need an umbrella?

    		if (rain_chance > 0.5){
    			console.log("Bring your umbrella!");
    		} else {
    			console.log("No umbrella needed!");
    		}
    	

##Let's tweet it!

Need to add another module:

    npm install node-twitter-api
    
We also need to create a new twitter app for your existing twitter account. 

FYI, you may not want to do this right now -- or ever! It will Tweet out at your account! You may want to make a new Twitter account. Either way, you log into the account you plan to use and go here:

    twitter.com/apps
    
Establish an app, and then generate a new token. 

Then back to the code, put this on top, right under `request = require('request');`

    var twitterAPI = require('node-twitter-api');
    var twitter = new twitterAPI({
        consumerKey: 'YOUR_KEY',
        consumerSecret: 'YOUR_SECRET'
    });
    var accessToken = "YOUR_TOKEN";
    var accessTokenSecret ="YOUR_TOKEN_SECRET";
    
And back below the umbrella code, add this:

	twitter.statuses("update", {
	        status: "This is a test of my bot."
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
	
Testing it from the command line ...
    
    node getweather.js

Now let's make it tweet about your umbrella. Change the weather code slightly:

    var umbrella_text = "";
    if (rain_chance > 0.5){
    	console.log("Bring your umbrella!");
    	umbrella_text ="May want to bring your umbrella today!"
    } else {
    	console.log("No umbrella needed!");
    	umbrella_text ="You can leave your umbrella at home today!"
    }


##Make it happen every day at 8 a.m.

From the command line:

    crontab -e

    node /home/ubuntu/getweather.js