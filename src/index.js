//var request = require('request')

exports.handler = function( event, context ){	

	var sessionAttributes = {} //variables stored from the last command.
	if(event.session.attributes)
		sessionAttributes = event.session.attributes
	
	
    if (event.request.type === "LaunchRequest") { //If Docker is launcher without intent.
        var out = "Hello, I am overwatch assistant. how may I help?"
        context.succeed({response: buildSpeechletResponse(out, false)})
    }else if(event.request.type === "SessionEndedRequest"){ //If docker is exited by saying "quit"
		var out = "Grab that napkin, you just got served"
		context.succeed({response: buildSpeechletResponse(out, true)})
	}else{ //If a command is given
		var IntentName = event.request.intent.name
        
        if(IntentName == "GetRankIntent"){

        }else if(IntentName == "GetMainIntent"){

        }else if(IntentName == "GetCharacterStatsIntent"){

        }else if(IntentName === "HelpIntent"){ //If help is asked for
			var out = "try asking about your favourite character."
			context.succeed({response: buildSpeechletResponse(out, false)})
		}else if(IntentName === "QuitIntent"){ //If the session is closed
			var out = "Heroes Never Die"
			context.succeed({response: buildSpeechletResponse(out, true)})
		}		
	}
}

/**
 * Makes a request to https://ow-api.com/v1/stats/
 * @param {*} platform pc, psn or xbl
 * @param {*} region us, eu, etc
 * @param {*} player battle-net, psn, or xbl name of player
 * @param {*} request The request to make
 */
function makeRequestToAPI(platform, region, player, request){
    
}


// request('https://docker.jhc.pw/containers', function (error, response, body) { //outputs the number of containers
//     if (!error && response.statusCode == 200) {
//         var parsedJson = JSON.parse(body) //parses the JSON
//         var output = "there are " + parsedJson.running_containers +" containers running, out of a total of " + parsedJson.total_containers + "."
        
//         context.succeed({response: buildSpeechletResponse(output, false)}) //tell alexa to say the repsonse, and carry on.
//     }
//     else{
//         context.succeed({response: buildSpeechletResponse("I cannae dew et cap'n", false)})//If the request fails (server is down).				
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
    }
}

