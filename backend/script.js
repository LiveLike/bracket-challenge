const route = "https://cf-blast.livelikecdn.com/api/v1/text-predictions/";
const numberPredRoute = "https://cf-blast.livelikecdn.com/api/v1/image-number-predictions/";

let program_id = "18548c37-59c1-47b3-929b-8c2d458fa66a";
const accessToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YjUwMWZlLWIwODQtNDZjMi04NjM5LWM3ZjJkNjljOGExMSIsImNsaWVudF9pZCI6Im1PQll1bDE4cXVmZnJCRHVxMklBQ0t0VnVMYlV6WElQeWU1UzNicTUiLCJhY2Nlc3NfdG9rZW4iOiJhaHF5SDY0WDRzVXExVm1jUHZlMUxPT1NRcWo2dmRCQU5ZRU5WYThELXBNVDNFcnkyb3E5TGciLCJpc19wcm9kdWNlciI6dHJ1ZSwiaXNzIjoiYmxhc3QiLCJpYXQiOjE2NTIwOTExODV9.IqkXgzjAeHZAyEJ5oKXqXpN61zVsSIjCFknrRtjKYEM";
const confirmation_message = "Thank you for your answer!";
const scheduledAt = new Date(Date.now());
const interactive_until = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5);

const numberOfTeamsSelect = document.getElementById("select-number-of-teams");
const generateWidgetsButton = document.getElementById("generate-widgets-button");
const generateProgramButton = document.getElementById("generate-program-button");
const teamsUnorderedListElement = document.getElementById("teams-list");


const options = []
const widgets = []


const publishWidget = (widgetId, scheduledAt, isNumberPredictionWidget) => {

    const route = getPath(isNumberPredictionWidget)+""+widgetId+"/schedule/"
    return axios({
        method: "put",
        url: route,
        headers: {
            Authorization: accessToken
        },
        data: {
            scheduled_at: scheduledAt
        }
    }).then((w) => {
        console.log(`widget published`);
        console.log(w);
    });
}

function getPath(isNumberPredictionWidget) {
    if(isNumberPredictionWidget) {
        return numberPredRoute
    } 
    return route
}


const createWidget = (programId, question, confirmation_message, options, scheduledAt, interactiveUntil, sendAttri, isNumberPredictionWidget) => {

    let path = getPath(isNumberPredictionWidget)

    var attributes = JSON.parse("[{\"key\": \"isInitialRound\",\"value\": \"true\"}]")
    var data = {
        program_id: programId,
        question: question,
        confirmation_message: confirmation_message,
        interactive_until: interactiveUntil,
        options: options
    }

    if (sendAttri) {
        data.widget_attributes = attributes
    }

    return axios({
        method: "post",
        url: path,
        headers: {
            Authorization: accessToken
        },
        data: data
    })

};

const run = () => {
    createWidget(program_id, question, confirmation_message, options, scheduledAt, interactive_until).then(x => {
        console.log("done");
    });
};


numberOfTeamsSelect.addEventListener("change", (e) => {
    let html = "";
    for (let i = 1; i <= +e.target.value; i++) {
        html += `<li><input type="text" placeholder="team ${i} name" value=""/> <input type="text" placeholder="team ${i} icon url" value="https://cf-blast-storage.livelikecdn.com/assets/7a973476-02f9-4b09-aa65-4091f0ceae76.png"</li>`;
    }
    teamsUnorderedListElement.innerHTML = html;
});


const generateWidgets = () => {

    options.length = 0
    widgets.length = 0
    var widgetsCreated = 0

    //Rounds Array with number of widgets
    let tempNoOfTeams = teamsUnorderedListElement.children.length;
    let noOfWidgetPerRoundArr = []
    let totalNoOfRounds = 0
    while (tempNoOfTeams > 1) {
        tempNoOfTeams = tempNoOfTeams / 2
        noOfWidgetPerRoundArr[totalNoOfRounds++] = tempNoOfTeams
    }


    //Create and Insert Options in Q
    for (let roundIndex = 0; roundIndex < totalNoOfRounds; roundIndex++) {
        for (let index = 0; index < noOfWidgetPerRoundArr[roundIndex]; index++) {
            let option = getOptions(index, roundIndex === 0)
            let widget = getWidget(index, roundIndex)
            options.push(option)
            widgets.push(widget)
        }

    }
    
    
    processWidgetQ(0,true)
    processWidgetQ(0,false)
}

function processWidgetQ(widgetProcessingIndex, isNumberPredictionWidget) {
    if(widgetProcessingIndex >= widgets.length) {
        return
    }

    let widget = widgets[widgetProcessingIndex]
    let option = options[widgetProcessingIndex]
    let sendAttri = widget.round === 0
    createWidget(program_id, widget.question, confirmation_message, option, scheduledAt, interactive_until, sendAttri,isNumberPredictionWidget)
        .then(response => {
            console.log("created widget "+widget.question)
            publishWidget(response.data.id, scheduledAt, isNumberPredictionWidget).then(res => {
                processWidgetQ(widgetProcessingIndex + 1,isNumberPredictionWidget)
            })
            
        });
}

function getWidget(index, round) {
    if (round === 0) {
        index = index * 2
        return {
            question: `${teamsUnorderedListElement.children[index].firstChild.value} vs ${teamsUnorderedListElement.children[index + 1].firstChild.value}`,
            round : round
        };
    }

    return {
        question: "Round " + (round + 1) + " Match " + (index + 1), round : round
    };
}

function getOptions(index, isFirstRound) {
    let option = []
    if (isFirstRound) {
        index = index * 2
        option.push({ description: teamsUnorderedListElement.children[index].firstChild.value, image_url: teamsUnorderedListElement.children[index].children[1].value });
        option.push({ description: teamsUnorderedListElement.children[index + 1].firstChild.value, image_url: teamsUnorderedListElement.children[index +1].children[1].value });
    } else {
        Array.prototype.forEach.call(teamsUnorderedListElement.children, child => {
            option.push({ description: child.firstChild.value, image_url: child.children[1].value })
        });

    }
    return option
}
generateWidgetsButton.addEventListener("click", (e) => {
    generateWidgets();
});

generateProgramButton.addEventListener("click", (e) => {
    let path = "https://cf-blast.livelikecdn.com/api/v1/programs/"

    var isoDate = new Date().toISOString()
    const programName = document.getElementById("bracket-name").value;

    var data = {
        client_id: "mOBYul18quffrBDuq2IACKtVuLbUzXIPye5S3bq5",
        title: programName,
        scheduled_at: isoDate
    }


    return axios({
        method: "post",
        url: path,
        headers: {
            Authorization: accessToken
        },
        data: data
    }).then(response => {
        document.getElementById("program_name").style.display = 'none'
        document.getElementById("team_area").style.display = 'block'
        program_id = response.data.id
    });
});

//run()