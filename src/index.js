var request = require('request')

/**
 * platform := pc, psn or xbl
 * region := us, eu, etc
 * player := battle-net, psn, or xbl name of player
 */
function Profile(){
    this.platform = "psn"
    this.region = "eu"
    this.player = "Tcr04sd1zzle"
}

exports.handler = function( event, context ){	

	var sessionAttributes = {} //variables stored from the last command.
	if(event.session.attributes)
		sessionAttributes = event.session.attributes
	
	
    if (event.request.type === "LaunchRequest") { //If OWA is launcher without intent.
        var out = "Hello, I am overwatch assistant. how may I help?"
        context.succeed({response: buildSpeechletResponse(out, false)})
    }else if(event.request.type === "SessionEndedRequest"){ //If OWA is exited by saying "quit"
		var out = "Heroes never die"
		context.succeed({response: buildSpeechletResponse(out, true)})
	}else{ //If a command is given
		var IntentName = event.request.intent.name
        
        if(IntentName == "GetRankIntent"){
            getRank(context)
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

function getRank(context){
    makeRequestToAPI(new Profile(), 'profile', function(res){
        
        var sr = res.rating
        var level = res.level
        var prestige = res.prestige

        var tts = "Your S.R. is " + sr + ", your level is " + level + ", prestige " + prestige
        if(sr == ""){
            tts = "You currently have no competitive rank, or S.R. your level is " + level + ", prestige " + prestige
        }

        context.succeed({response: buildSpeechletResponse(tts, false)}) 
    })
}

/**
 * Makes a request to https://ow-api.com/v1/stats/
 */
function makeRequestToAPI(profile, apiReq, callback){
    var nameOK = true
    var reqOK = true
    var serverOK = true
    var json = {}

    request(getURL(profile, apiReq), function(error, res, body){
        // if(error){
        //     switch(res.statusCode){
        //         case 400:
        //             reqOK = false
        //             break
        //         case 404:
        //             nameOK = false
        //             break
        //         case 406:
        //             reqOK = false
        //             break
        //         case 500:
        //             serverOK = false
        //             break
        //         case 503:
        //             serverOK = false
        //             break
        //     }
        // }else{
        if(!error && res.statusCode == 200){
            console.log(body)
            json = JSON.parse(body)
        }
        callback(json)//{nameOK: nameOK, requestOK: reqOK, serverOK: serverOK, response: json})
    })
}

function getURL(prf, req){
    var url = 'https://ow-api.com/v1/stats/' + prf.platform + '/'
    url += prf.region + '/'
    url += prf.player + '/'
    url += req

    ///return 'https://ow-api.com/v1/stats/'
    console.log(url)
    return url
}

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

