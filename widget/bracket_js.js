//GetPostedWidgts
//render first 8 widgets with options
//render next round 4 widgets without options
//render next round 2 widgets without options
//render next round 2 widgets without options


var widgetIds = []
var roundsArr = []
let textPredictionWidgetIdArr = []
const widgetInteractionSet = new Set();
let totalNoOfWidgets = 0

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
            widget.updateOptions(widgetInteraction)
            widget.results()
            processNextWidgetOnPrediction(widget.widgetId, widget.options)
            checkIfAllPredictionsDone()
        } else {
            //If follow up is present then enter into result
            widget.options.forEach(option =>{
                if(option.correct_number  !== null){
                    widget.results()
                    return
                }
            })
            
            widget.interactive()
        }
    })
}

function getWidgetVote(program_id, widgetArr) {
    return LiveLike.getWidgetInteractions({
        programId: program_id,
        widgets: widgetArr,
    })
}


function listenToFollowUpWidget(){
    LiveLike.addWidgetListener(
        {programId: programId}, 
        (e) => {
            let imagePredWidgetId = e.widgetPayload.image_number_prediction_id
            let numberPredWidget = queryWidgetUsingId(imagePredWidgetId)
            if(numberPredWidget !== null && numberPredWidget !== undefined) {
                numberPredWidget.updateFollowUp(e.widgetPayload.options)
            }
            
        }
      );
}

function registerCustomTimeline() {

    // Gets initial list of widgets
    LiveLike.getWidgets({
        programId: programId,
        status: "published", //Valid status values are 'scheduled', 'pending', 'published'
        widgetKinds: ["image-number-prediction"],
        ordering: "", //Valid ordering values are 'recent'
        interactive: true  //Valid interactive values are true, false
    }).then(({ results }) => {

        var numberPredsResults = results
        totalNoOfWidgets = results.length
        //get text prediction widgets and map it with number widgets
        LiveLike.getWidgets({
            programId: programId,
            status: "published", //Valid status values are 'scheduled', 'pending', 'published'
            widgetKinds: ["text-prediction"],
            ordering: "", //Valid ordering values are 'recent'
            interactive: true  //Valid interactive values are true, false
        }).then(({ results }) => {

            let widgetContainer = document.querySelector('#placeHolder')
            results.forEach(
                widgetPayload => {
                    textPredictionWidgetIdArr[textPredictionWidgetIdArr.length] = widgetPayload.id
                    widgetContainer.showWidget({
                        widgetPayload,
                        mode: ({ widget }) => {
                            return widgetContainer.attach(widget, 'append')
                        },
                        initialLoad: true
                    })
                })
            let nextRoundIndex = renderFirstRoundWidgets(numberPredsResults)
            roundsArr[0] = nextRoundIndex
            let arrayIndex = 0
            while (roundsArr[arrayIndex] < numberPredsResults.length) {
                arrayIndex++
                roundsArr[arrayIndex] = roundsArr[arrayIndex - 1] + (nextRoundIndex / (arrayIndex * 2))
            }

            renderRoundTwo(numberPredsResults)
            renderRoundThree(numberPredsResults)
            listenToFollowUpWidget() 
        });
    })
}

function renderRoundTwo(results) {
    let index = 0
    //for (let i = 1; i < roundsArr.length; i++) {
        let roundTwoLength = roundsArr[1] - roundsArr[0]
        let roundTwoHalfWay = roundTwoLength / 2

        let roundTwoLeftContainer
        let roundTwoRightContainer
        if(window.screen.width > 767) {
            roundTwoLeftContainer = document.querySelector('#roundTwoLeft')
            roundTwoRightContainer = document.querySelector('#roundTwoRight')
        } else {
            roundTwoLeftContainer = document.querySelector('#roundTwoLeft_m')
            roundTwoRightContainer = document.querySelector('#roundTwoRight_m')
        }
       

        roundTwoLeftContainer.customWidgetRenderer = leftPanelCustomWidgetRenderer;
        roundTwoRightContainer.customWidgetRenderer = rightCustomWidgetRenderer;

        for (index = roundsArr[0]; index < roundsArr[1]; index++) {
            let widgetPayload = results[index]
            widgetIds[index] = widgetPayload.id
            widgetPayload.positionCenter = true
            widgetPayload.isSemiFinal = true

            if(index < (roundsArr[0] + roundTwoHalfWay)){
                initWidget(roundTwoLeftContainer,widgetPayload)
            } else {
                initWidget(roundTwoRightContainer,widgetPayload)
            }
        }
    //}
}

function renderRoundThree(results) {
    let index = 0
    //for (let i = 1; i < roundsArr.length; i++) {
        let roundFinalContainer
        if(window.screen.width > 767) {
            roundFinalContainer = document.querySelector('#final')
        } else {
            roundFinalContainer = document.querySelector('#final_m')
        }
        roundFinalContainer.customWidgetRenderer = rightCustomWidgetRenderer;
        for (index = roundsArr[1]; index < roundsArr[2]; index++) {
            let widgetPayload = results[index]
            widgetIds[index] = widgetPayload.id
            widgetPayload.positionCenter = true
            initWidget(roundFinalContainer,widgetPayload)
        }
    //}
}

function renderRemainingRounds(results) {
    let index = 0
    for (let i = 1; i < roundsArr.length; i++) {
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
    let roundOneContainerLeft
    let roundOneContainerRight
    if(window.screen.width > 767) {
        roundOneContainerLeft = document.querySelector('#roundOneLeft')
        roundOneContainerRight = document.querySelector('#roundOneRight')
    } else {
        roundOneContainerLeft = document.querySelector('#roundOneLeft_m')
        roundOneContainerRight = document.querySelector('#roundOneRight_m')
    }

    roundOneContainerLeft.customWidgetRenderer = leftPanelCustomWidgetRenderer;
    roundOneContainerRight.customWidgetRenderer = rightCustomWidgetRenderer;

    let halfWayMark = results.length / 4
    let index = 1
    results.forEach(
        widgetPayload => {
            if (isInitialRound(widgetPayload)) {
                widgetIds[nextRoundIndex] = widgetPayload.id
                if(index % 2 == 0) {
                    widgetPayload.extraMargin = true
                } 
                index++
                if (nextRoundIndex < halfWayMark) {
                    initWidget(roundOneContainerLeft, widgetPayload)
                } else {
                    initWidget(roundOneContainerRight, widgetPayload)
                }
                nextRoundIndex = nextRoundIndex + 1
            }
        }
    )

    return nextRoundIndex
}

function initWidget(container, widgetPayload) {
    container.showWidget({
        widgetPayload,
        mode: ({ widget }) => {
            return container.attach(widget, 'append').then(() => {
                setWidgetPhase(widget)
                //widget.interactive()
            })
        },
        initialLoad: true
    })
}

document.addEventListener("widgetattached", function (e) {
    if(e.detail.element.showOptions) {
        e.detail.element.showOptions(isInitialRound(e.detail.widget))    
    }
    
    e.detail.element.addEventListener('number-prediction', (e) => {
        processNextWidgetOnPrediction(e.detail.widget.id, e.detail.widget.options)
        checkIfAllPredictionsDone()

    })
});

function checkIfAllPredictionsDone() {
    if(widgetInteractionSet.size == totalNoOfWidgets) {
        //All preds done
        //alert("All Predictions done")
        document.getElementById("alert_w_leaderboard").style.display = 'block'
    }
}

function processNextWidgetOnPrediction(widgetId, options) {

    widgetInteractionSet.add(widgetId)

    let maxVotedOptions = options[0]
    options.forEach(option => {
        if (option.number > maxVotedOptions.number) {
            maxVotedOptions = option
        }
    })

    let widgetIndexInArr = widgetIds.findIndex(function (element) {
        return element === widgetId;
    });

    //Set Winner of Text Prediction Widget. 
    selectOptionOnTextPrediction(widgetIndexInArr, maxVotedOptions.description)

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
    let widgetElm = queryWidgetUsingId(widgetIdTobeInteracted)

    if (!widgetElm) {
        return
    }

    selectUnSelectNewOption(isSlotOne, widgetElm, maxVotedOptions.description)
}

function queryWidgetUsingId(widgetIdTobeInteracted) {
    return document.querySelectorAll(`[widgetid='${widgetIdTobeInteracted}']`)[0]
}

function selectOptionOnTextPrediction(widgetIndexInArr, selectedOption) {
    let textPredictionWidgetId = textPredictionWidgetIdArr[widgetIndexInArr]
    let textPredWidgetElm = document.querySelectorAll(`[widgetid='${textPredictionWidgetId}']`)[0]
    let optionsArr = textPredWidgetElm.querySelectorAll('livelike-option')
    let txtWidgetSelectedOption = Array.from(optionsArr).find(function (element) {
        return element.__item.description === selectedOption
    })
    txtWidgetSelectedOption.optionSelected()
}

function isInitialRound(widgetPayload) {
    let isInitialWidget = widgetPayload.widget_attributes.find(function (element) {
        return element.key === 'isInitialRound'
    })
    return isInitialWidget != undefined && isInitialWidget.value === 'true'
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

    if(widgetElm.widgetPayload.slot1 && widgetElm.widgetPayload.slot2 )
        widgetElm.showPredictionButton()
    return selectedOptionInNewWidget
}
