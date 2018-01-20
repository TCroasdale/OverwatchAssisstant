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
        }
        else if(IntentName == "GetMainIntent"){

        }
        else if(IntentName == "GetCharacterStatsIntent"){
            var hero = parseHeroSlot(event.request.intent.slots.heroName.value)
            getCharacterStats(context, hero);
        }
        else if(IntentName === "HelpIntent"){ //If help is asked for
			var out = "try asking about your favourite character."
			context.succeed({response: buildSpeechletResponse(out, false)})
        }
        else if(IntentName === "QuitIntent"){ //If the session is closed
			var out = "Heroes Never Die"
			context.succeed({response: buildSpeechletResponse(out, true)})
		}		
	}
}

/**
 * Processes a getRankIntent request
 * @param {*} context The amazon alexa context.
 */
function getRank(context){
    makeRequestToAPI(new Profile(), 'profile', function(res){
        
        var sr = res.response.rating
        var level = res.response.level
        var prestige = res.response.prestige
        var rank = res.response.ratingName

        var tts = "Your rank is " + rank + " , with " + sr + " sr. you are level " + level + ", prestige " + prestige
        if(sr == ""){ //sr="" if there is no rank for this season.
            tts = "You currently have no competitive rank. you are level  " + level + ", prestige " + prestige
        }

        //Making sure the data fetched was valid.
        if(!res.nameOK || !res.requestOK || !res.serverOK){
            tts = "There was a problem fetching that information."
            if(!res.nameOK){
                tts += " The name you provded wasn't valid."
            }
            if(!res.requestOK){
                tts += " This was my fault, I made a bad request."
            }
            if(!res.serverOK){
                tts += " there was a problem with the A.P.I servers"
            }
        }

        context.succeed({response: buildSpeechletResponse(tts, false)}) 
    })
}

/**
 * processes a getCharacterStatsIntent request
 * @param {Alexa Context} context The alexa context provided 
 * @param {string} hero The Hero name (must be the API version) 
 */
function getCharacterStats(context, hero){
    makeRequestToAPI(new Profile(), 'heroes/'+hero, function(res){
        var tts = ""
        //Making sure the data fetched was valid.
        if(!res.nameOK || !res.requestOK || !res.serverOK){
            tts = "There was a problem fetching that information."
            if(!res.nameOK){
                tts += " The name you provded wasn't valid."
            }
            if(!res.requestOK){
                tts += " This was my fault, I made a bad request."
            }
            if(!res.serverOK){
                tts += " there was a problem with the A.P.I servers"
            }
        }
        else{
            var compStats = res.response.competitiveStats.topHeroes[hero]
            var qpStats = res.response.quickPlayStats.topHeroes[hero]

            if(compStats.timePlayed != "--"){
                tts = "In competitive: " + statsToSentence(compStats)
            }else if(qpStats.timePlayed != "--"){
                tts = "In competitive: " + statsToSentence(qpStats)
            }else{
                tts = "You haven't played as " + hero
            }
        }

        context.succeed({response: buildSpeechletResponse(tts, false)}) 
    })
}

/**
 * Converts JSON hero stats to an english sentence
 * @param {JSON object of hero stats} statsJS 
 */
function statsToSentence(statsJS){
    var sentence = "You have played for " + statsJS.timePlayed
    sentence += ". won: " + statsJS.gamesWon + " games, thats a " + statsJS.winPercentage
    sentence += " percent win rate."
    sentence += " you normally get: " + statsJS.eliminationsPerLife + " eliminations per life, your best multikill: is"
    sentence += statsJS.multiKillBest + " kills. your accuracy is: " + statsJS.weaponAccuracy + " percent."
    
    return sentence
}

/**
 * Makes a request to the API.
 * @param {Profile} profile The profile of the user 
 * @param {string} apiReq The request to make
 * @param {function(jsonresponse)} callback The callback function, called once request has been returned
 */
function makeRequestToAPI(profile, apiReq, callback){
    var nameOK = true
    var reqOK = true
    var serverOK = true
    var json = {}

    request(getURL(profile, apiReq), function(error, res, body){   
        if(!error && res.statusCode == 200){
            console.log(body)
            json = JSON.parse(body)
        }else if(!error){
            switch(res.statusCode){
                case 400:
                    reqOK = false
                    break
                case 404:
                    nameOK = false
                    break
                case 406:
                    reqOK = false
                    break
                case 500:
                    serverOK = false
                    break
                case 503:
                    serverOK = false
                    break
            }
        }
        callback({nameOK: nameOK, requestOK: reqOK, serverOK: serverOK, response: json})
    })
}

/**
 * constructs and returns the URL you need.
 * @param {Profile} prf The profile object for the user 
 * @param {string} req the end of the url
 */
function getURL(prf, req){
    var url = 'https://ow-api.com/v1/stats/' + prf.platform + '/'
    url += prf.region + '/'
    url += prf.player + '/'
    url += req

    return url
}

/**
 * Returns the correct version of a hero name for the API
 * @param {string} hero The name of the hero, from hero slot
 */
function parseHeroSlot(hero){
    if(hero == 'diva'){
        return 'dVa'
    }
    else if(hero == 'soldier 76'){
        return 'soldier76'
    }
    return hero;
}

/**
 * returns the json which makes alexa talk.
 * @param {string} say What alexa should say
 * @param {bool} shouldEndSession whether or not alexa should close OWA
 */
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

