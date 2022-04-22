//GetPostedWidgts
//render first 8 widgets with options
//render next round 4 widgets without options
//render next round 2 widgets without options
//render next round 2 widgets without options

LiveLike.init({
    clientId: 'mOBYul18quffrBDuq2IACKtVuLbUzXIPye5S3bq5',
}).then(() => {
    registerCustomTimeline()
});

var widgetIds = []
var roundsArr = []
const widgetContainer = setupWidgetContainer()

function setupWidgetContainer() {
    let widgetContainer = document.querySelectorAll('livelike-widgets');
    widgetContainer.forEach(container => {
        LiveLike.registerWidgetMode(
            'customTimeline',
            ({ widget }) => {
                container
                    .attach(widget)
                    .then(() => {
                        setWidgetPhase(widget)
                    })
            }
        )
    })
    return widgetContainer
}

const setWidgetPhase = (widget) => {
    getWidgetVote(widget.program_id, [{ kind: widget.kind, id: widget.widgetId }]).then(interactions => {
        if (interactions[widget.kind] && interactions[widget.kind].length > 0) {
            const widgetInteraction = interactions[widget.kind][0];
            setWidgetInteraction(widgetInteraction, widget);
            //widget.results()
        } else {
            // widget.addEventListener('vote', function (e) {
            //     //Add widgetid to set
            //     enableSubmitButton()
            // })
            // if (widget.timeout) {
            //     var date = new Date(widget.widgetPayload.published_at)
            //     var curr = Date.now()
            //     //curr = curr.getTime() / 1000;
            //     var expiry_date = new Date(date.valueOf() + convertDuration(widget.widgetPayload.timeout))
            //     expiry_date = expiry_date.getTime()
            //     var isValid = curr < expiry_date
            //     const diff = expiry_date - curr;

            //     if (isValid)//&& timeout expired
            //     {
            //         widget.interactive({ timeout: diff }).then(widget.results);
            //     }
            //     else {
            //         widget.results()
            //     }
            // }

        }
    })
}

function getWidgetVote(program_id, widgetArr) {
    return LiveLike.getWidgetInteractions({
        programId: program_id,
        widgets: widgetArr,
    })
}

const setWidgetInteraction = (interaction, widget) => {
    const optionOrChoice = interaction.option_id || interaction.choice_id;
    if (optionOrChoice) {
        const selectedOption = { id: optionOrChoice };
        if (interaction.hasOwnProperty("is_correct")) {
            selectedOption.is_correct = interaction.is_correct;
        }
        widget.selectedOption = selectedOption;
    }
    if (interaction.magnitude)
        widget.average_magnitude = interaction.magnitude;
};

function registerCustomTimeline() {
    // Gets initial list of widgets
    LiveLike.getWidgets({
        programId: "8a0c4ed4-d106-464f-9d9c-d3605801f2b3",
        status: "published", //Valid status values are 'scheduled', 'pending', 'published'
        widgetKinds: ["text-prediction"],
        ordering: "recent", //Valid ordering values are 'recent'
        interactive: true  //Valid interactive values are true, false
    }).then(({ results }) => {
        let nextRoundIndex = renderFirstRoundWidgets(results)
        roundsArr[0] = nextRoundIndex
        let arrayIndex = 0
        while (roundsArr[arrayIndex] < results.length) {
            arrayIndex++
            roundsArr[arrayIndex] = roundsArr[arrayIndex - 1] + (nextRoundIndex / (arrayIndex * 2))
        }

        renderRemainingRounds(results)
    })
}

function renderRemainingRounds(results) {
    let index = 0
    for (let i = 1; i < roundsArr.length; i++) {
        widgetContainer[i].customWidgetRenderer = customWidgetRenderer;
        for (index = roundsArr[i - 1]; index < roundsArr[i]; index++) {
            let widgetPayload = results[index]
            widgetIds[index] = widgetPayload.id
            widgetContainer[i].showWidget({
                widgetPayload,
                mode: ({ widget }) => {
                    return widgetContainer[i].attach(widget, 'append').then(() => {
                        setWidgetPhase(widget)
                        //widget.interactive()
                    })
                },
                initialLoad: true
            })
        }
    }
}

function renderFirstRoundWidgets(results) {
    let nextRoundIndex = 0
    results.forEach(
        widgetPayload => {
            if (isInitialRound(widgetPayload)) {
                widgetIds[nextRoundIndex] = widgetPayload.id
                nextRoundIndex = nextRoundIndex + 1
                widgetContainer[0].showWidget({
                    widgetPayload,
                    mode: ({ widget }) => {
                        return widgetContainer[0].attach(widget, 'append').then(() => {
                            setWidgetPhase(widget)
                            //widget.interactive()
                        })
                    },
                    initialLoad: true
                })
            }
        }
    )

    return nextRoundIndex
}

document.addEventListener("widgetattached", function (e) {
    e.detail.element.addEventListener('prediction', (e) => {
        processNextWidgetOnPrediction(e.detail.widget.id, e.detail.widget.options, e.detail.prediction.option_id)

    })
});

function processNextWidgetOnPrediction(widgetId, options, predictionId) {

    let selectedOption = options.find(function (element) {
        return element.id === predictionId
    }).description

    let widgetIndexInArr = widgetIds.findIndex(function (element) {
        return element === widgetId;
    });

    let roundIndexInArr = roundsArr.findIndex(function (element) {
        return element > widgetIndexInArr;
    });


    let isSlotOne = false
    if (widgetIndexInArr % 2 === 0) {
        //Odd number widget
        widgetIndexInArr = widgetIndexInArr + 1
        isSlotOne = true
    }

    let prevSlotEnd = 0
    let currentSlotEnd = roundsArr[roundIndexInArr]
    if (roundIndexInArr > 0) {
        prevSlotEnd = roundsArr[roundIndexInArr - 1]

    }

    let calculatedIndex = ((widgetIndexInArr - prevSlotEnd) / 2) + currentSlotEnd
    let widgetIdTobeInteracted = widgetIds[Math.floor(calculatedIndex)]
    let widgetElm = document.querySelectorAll(`[widgetid='${widgetIdTobeInteracted}']`)[0]

    if (!widgetElm) {
        return
    }

    let selectedOptionInNewWidget = selectUnSelectNewOption(isSlotOne, widgetElm, selectedOption)
    setWidgetTitle(widgetElm)
}

function isInitialRound(widgetPayload) {
    return widgetPayload.widget_attributes[0] != undefined && widgetPayload.widget_attributes[0].value === 'true'
}

function setWidgetTitle(widgetElm) {
    let titleString = undefined
    if (widgetElm.widgetPayload.slot1) {
        titleString = widgetElm.widgetPayload.slot1 + " Vs "
    }
    if (widgetElm.widgetPayload.slot2) {
        titleString = titleString + widgetElm.widgetPayload.slot2
    }

    if (titleString) {
        widgetElm.querySelector("livelike-title").innerText = titleString
    }
}

function selectUnSelectNewOption(isSlotOne, widgetElm, selectedOption) {
    let prevSelectedOption
    if (isSlotOne) {
        //check if slot1 already filled if yes then hide it
        //assign it to slot1 var and show new option
        if (widgetElm.widgetPayload.slot1) {
            prevSelectedOption = widgetElm.widgetPayload.slot1

        }
        widgetElm.widgetPayload.slot1 = selectedOption
    } else {
        //check if slot2 already filled if yes then hide it
        //assign it to slot1 var and show new option
        if (widgetElm.widgetPayload.slot2) {
            prevSelectedOption = widgetElm.widgetPayload.slot2

        }
        widgetElm.widgetPayload.slot2 = selectedOption
    }

    let optionsArr = widgetElm.querySelectorAll('livelike-option')

    let selectedOptionInNewWidget = Array.from(optionsArr).find(function (element) {
        return element.__item.description === selectedOption
    })
    selectedOptionInNewWidget.style.display = 'flex'

    if (prevSelectedOption) {
        let prevSelectedOptionElm = Array.from(optionsArr).find(function (element) {
            return element.__item.description === prevSelectedOption
        })

        prevSelectedOptionElm.style.display = 'none'
        if (prevSelectedOptionElm.selected === true) {
            // set new option as vote 
            selectedOptionInNewWidget.optionSelected()
        }
    }
    return selectedOptionInNewWidget
}
