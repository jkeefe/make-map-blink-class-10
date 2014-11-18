#Computing in the Cloud

_Note: This guide makes slightly more sense when I'm teaching it. If you have questions or spot gaps, feel free to reach out at john (at) johnkeefe.net_

First a quick discussion about EC2 v S3.

**S3** holds static files, such as html and js files. If you use it as a web hosting place, which is common, you just want to make sure all the files are public.

So that poses a problem when you have API keys!

**EC2** is a live computer where you can run programs -- including programs that use your API keys. 

##Fire Up Your Cloud Computer

- go to [http://aws.amazon.com](http://aws.amazon.com)
- Sign up with your Amazon account. You will be asked for your credit card, and spending money is possible here. But today's steps involve spinning up a "micro" server which will run a year for free. You'll want to shut it down to avoid being charged in a year!
- Go to the AWS Management Console
- If you don't see "N. Virginia" next to your name at the top, change it to that
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

Now we can log in. You get the IP address by clicking on the EC2 instance in your Amazon console at aws.amazon.com and looking at the "Public IP":

    ssh ubuntu@<public IP>
	( like ssh ubuntu@12.34.56.78 )
        
You in? If so, there are some things we need to install, including "node" and the node package manager, "npm"

    sudo apt-get update
    sudo apt-get install nodejs
    sudo apt-get install npm
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
    	url: 'https://api.forecast.io/forecast/YOUR_API_KEY_HERE/40.7056,-73.978',
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
    
Create an app, filling out the required boxes. I'm giving this short shrift here, but take some time to look through it. A couple of tips, tho:

	- You can ignore the callback part
	- Access level should be both READ and WRITE
	- You need to click on the link, "manage keys and access tokens"
	- You're going to need the following long strings of characters
		* Consumer Key
		* Consumer Secret
		* Access Token
		* Access Token Secret
	- The last two you may have to generate with a click of a button

Then back to the code, put this on top, right under `request = require('request');`

    var twitterAPI = require('node-twitter-api');
    var twitter = new twitterAPI({
        consumerKey: 'YOUR_KEY',
        consumerSecret: 'YOUR_SECRET'
    });
    var accessToken = "YOUR_TOKEN";
    var accessTokenSecret ="YOUR_TOKEN_SECRET";
	
Go in an change the varialbes in all caps, like YOUR_KEY, to your actual key, preserving the quotes. So:

	consumerKey: '1234gibberish987moregibbersish' ...
	
And so on.
    
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

Check your Twitter account! Did it tweet?!


Now let's make it tweet about your umbrella. Change the weather code slightly:

    var umbrella_text = "";
    if (rain_chance > 0.5){
    	console.log("Bring your umbrella!");
    	umbrella_text ="May want to bring your umbrella today!"
    } else {
    	console.log("No umbrella needed!");
    	umbrella_text ="You can leave your umbrella at home today!"
    }

Testing it from the command line ...
    
    node getweather.js
	
Did it work?


##Make it happen every day at 7 a.m.

We're going to create a "cron job." That's a little command to run something at a particular time, or at particular intervals. It's a little cryptic, but what we want to add here is a command to execute 'node getweather.js' every day at 7 a.m.

To do this, we edit the cron file from the command line:

    crontab -e

Pick "nano" as your text editor.

There's info in the file there about how it works. We're going to add in the following line at the end of the file:

	0 7 * * * node /home/ubuntu/getweather.js

Make sure you end that line with a carriage return, or it won't execute! (I have often made this mistake.)

Note that we use the _full_ path for the getweather.js file, which is: `/home/ubuntu/getweather.js`

Now you're set. Check it tomorrow at 7 a.m.


