//var APP_ID = amzn1.ask.skill.a70b8c03-f730-46b0-9956-2186c672f720
//App ID, set once the skill is done.

var request = require('request');

String.prototype.replaceAll = function(search, replacement) { //A function that lets us easily replace characters in strings.
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

exports.handler = function( event, context ){	

	var sessionAttributes = {}; //variables stored from the last command.
	if(event.session.attributes)
		sessionAttributes = event.session.attributes;
	
	
    if (event.request.type === "LaunchRequest") { //If Docker is launcher without intent.
        var out = "Hello, I am overwatch assistant. how may I help?"
        context.succeed({response: buildSpeechletResponse(out, false)});
    }else if(event.request.type === "SessionEndedRequest"){ //If docker is exited by saying "quit"
		var out = "Grab that napkin, you just got served";
		context.succeed({response: buildSpeechletResponse(out, true)});
	}else{ //If a command is given
		var IntentName = event.request.intent.name;
        
        if(IntentName == "GetRankIntent"){

        }else if(IntentName == "GetMainIntent"){

        }else if(IntentName == "GetCharacterStatsIntent"){

        }else if(IntentName === "HelpIntent"){ //If help is asked for
			var out = "try asking about your favourite character.";
			context.succeed({response: buildSpeechletResponse(out, false)});
		}else if(IntentName === "QuitIntent"){ //If the session is closed
			var out = "Heroes Never Die";
			context.succeed({response: buildSpeechletResponse(out, true)});
		}		
	}
};

// request('https://docker.jhc.pw/containers', function (error, response, body) { //outputs the number of containers
//     if (!error && response.statusCode == 200) {
//         var parsedJson = JSON.parse(body); //parses the JSON
//         var output = "there are " + parsedJson.running_containers +" containers running, out of a total of " + parsedJson.total_containers + ".";
        
//         context.succeed({response: buildSpeechletResponse(output, false)}); //tell alexa to say the repsonse, and carry on.
//     }
//     else{
//         context.succeed({response: buildSpeechletResponse("I cannae dew et cap'n", false)});//If the request fails (server is down).				
//     }
// })		

function buildSpeechletResponse(say, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: "<speak>" + say + "</speak>"
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>Please try again.</speak>"
            }
        },
        shouldEndSession: shouldEndSession
    };
}

