class BaseCustomImagePrediction extends LiveLikeNumberPrediction {

    option_show = "display:none";
    predictBtnVisibility = "hidden"
    index = 0
    semiFinalImage = "assets/semi_2.png"
    semiFinalImageClass = "semi_2"
    footerClass = "right-livelike-footer"
    allowClickOnOption = false
    checkForDuplicates = true

    connectedCallback() {
        super.connectedCallback().then(() => {
            this.options.forEach(option => {
                option.number = 0
            })
        })
    }

    updateOptions = interaction => {
        interaction.votes.forEach(vote => {
            const idx = this.options.findIndex(c => c.id === vote.option_id);
            this.options[idx].number = vote.number;
        })

        let maxVoteOption = this.options[0]
        this.options.forEach(option => {
            if (maxVoteOption.number < option.number) {
                maxVoteOption = option
            }
        })
        this.greyOutLosingTeam(maxVoteOption)
        this.requestUpdate();
    }

    showPredictionButton() {
        this.predictBtnVisibility = "visible"
        this.requestUpdate();
    }

    updateFollowUp = (updatedOptions) => {
        let index = 0
        updatedOptions.forEach(updatedOption => {
            this.options[index++].correct_number = updatedOption.correct_number
        })
        this.requestUpdate();
    }

    validateAndSubmitVote = (options, manuallySelectedOption = undefined) => {
        let maxVoteOption = manuallySelectedOption !== undefined ? manuallySelectedOption : options[0]
        let totalVotes = 0

        if(manuallySelectedOption === undefined) {
            options.forEach(option => {
                if (maxVoteOption.number < option.number) {
                    maxVoteOption = option
                }
                totalVotes += option.number
            })
        }
    

        let maxScoreAttribute = this.findAttributeValue('maxScore')
        if(maxScoreAttribute !== null) {
            let duplicateVotes = options.find(function (option) {
                return option.number === maxVoteOption.number && option.id !== maxVoteOption.id
            })

            if(duplicateVotes !== undefined && this.checkForDuplicates === true) {
                this.setAllowClickOptions(true)
            } else {
                this.lockInCorrectVote(options, maxVoteOption)
            }
        } else {
            let maxVotesNeeded = this.getMaxVoteNeeded()
            if(maxScoreAttribute !== null || (maxVoteOption.number == maxVotesNeeded && totalVotes <= bestOfAttributeValue)) {
                this.lockInCorrectVote(options, maxVoteOption)
            } else {
                this.showInputBoxError(true)
            }
        }
    }

    lockInCorrectVote(options, maxVoteOption) {
        this.lockInVote(options)
        this.greyOutLosingTeam(maxVoteOption)
        this.showInputBoxError(false)
    }

    greyOutLosingTeam(maxVoteOption) {
        this.querySelectorAll('livelike-image').forEach(livelikeImageNode =>{
            if(livelikeImageNode.childNodes[0].alt !== maxVoteOption.description) {
                livelikeImageNode.childNodes[0].classList.add('.greyed')
            }
        })
    }

    showInputBoxError(show) {
        let errorElement = document.getElementById('validation_error')
        
        if(show) {
            errorElement.classList.add('show')
        } else {
            errorElement.classList.remove('show')
        }

        if(show) {
            if(this.getBestOfValueFromWidget() === 5) {
                document.getElementById('error_content').innerHTML = "Au meilleur des cinq matchs"
            } else {
                document.getElementById('error_content').innerHTML = "Au meilleur des trois matchs"
            }
            
        }
        
    }
    
    showOptions(show) {
        show ? this.option_show = "display:flex" : this.option_show = "display:none";
        if (show) {
            this.showPredictionButton()
        }

    }

    getBestOfValueFromWidget() {
        let bestOfAttribute = this.findAttributeValue('bestOf')
        let bestOfAttributeValue = 3
        if (bestOfAttribute !== null && bestOfAttribute !== undefined) {
            bestOfAttributeValue = parseInt(bestOfAttribute.value)
        }
        return bestOfAttributeValue
    }

    findAttributeValue(attributeName) {
        return this.widgetPayload.widget_attributes.find(function (element) {
            return element.key === attributeName
        })
    }

    getInputContainerClass() {
        return "livelike-voting-input-container"
    }

    getClassForOption(index, halfIndex) {
        let className = "livelike-option-end"
        if (index > halfIndex) {
            className = "livelike-option-start"
        }
        return className
    }

    keypressHandler = e => e.which === 46 && (e.returnValue = false);

    inputHandler = (option, e) => {
        const idx = e.target.value.indexOf('.');
        idx !== -1 && (e.target.value = e.target.value.replace(/[.][0-9]+$/, ""));
        const number = e.target.value ? +e.target.value : null
        this.setAllowClickOptions(false)
        this.updateOption(option, number);
    }

    setAllowClickOptions(allow) {
        this.allowClickOnOption = allow
        this.querySelectorAll('#draw_error')[0].style.visibility = allow ? 'visible' : 'hidden'
    }

    getClassForOption(index, halfIndex) {
        let className = "livelike-option-end"
        if (index > halfIndex) {
            className = "livelike-option-start"
        }
        return className
    }

    getFlexDirectionForRoot() {
        if(this.widgetPayload.isSemiFinal == true) {
            return "flex-direction:row-reverse"    
        }
        return "flex-direction:row"
    }

    getMaxVoteNeeded() {
        let maxScore = this.findAttributeValue('maxScore')
        if( maxScore != null) {
            return parseInt(maxScore.value)
        } 

        let bestOfAttributeValue = this.getBestOfValueFromWidget()
        return Math.ceil(bestOfAttributeValue / 2)
        
    }

    selectOptionOnClick(option) {
        if(this.allowClickOnOption === false) {
            return false
        }
        this.setAllowClickOptions(false)
        this.checkForDuplicates = false
        this.validateAndSubmitVote(this.options, option)
        this.checkForDuplicates = true
    }

    render() {
        let index = 0
        let halfIndex = this.options.length / 2
        let rootClassName = "custom-widget"
        if(this.widgetPayload.extraMargin === true) {
            rootClassName = "custom-widget-position-bottom"
        }
        if(this.widgetPayload.positionCenter === true) {
            rootClassName = "custom-widget-position-center"
        }

        let maxVotesNeeded = this.getMaxVoteNeeded()

        return html`
<template kind="text-prediction">
<livelike-widget-root style="display:flex; ${this.getFlexDirectionForRoot()}" class="${rootClassName}">
<img style="display:${this.widgetPayload.isSemiFinal == true ? "block" : "none"}" class="${this.semiFinalImageClass}" src="${this.semiFinalImage}">
<livelike-widget-body>

${this.options.map((option, idx) => {
            index++
            let className = this.getClassForOption(index, halfIndex)
            const correct = option.number === option.correct_number;
            return html`      
            <livelike-option class=${className} style="${this.option_show}" index="${idx}">
            <livelike-image @click="${(e) => this.selectOptionOnClick(option)}" height="55px" width="55px"></livelike-image>
              <div class=${this.getInputContainerClass()}>
                <input 
                  class="livelike-voting-number-input user-number-input"
                  type="number" 
                  placeholder="-"
                  oninput="(!validity.rangeOverflow||(value=${maxVotesNeeded})) && (!validity.rangeUnderflow||(value=0)) &&
                  (!validity.stepMismatch||(value=parseInt(this.value)));"
                  .value="${option.number}"
                  min="0" 
                  max="${maxVotesNeeded}"
                  maxlength="1"
                  @keypress=${this.keypressHandler}
                  @input=${(e) => this.inputHandler(option, e)}
                  ?disabled="${this.disabled || this.voteDisable}"
                />
              
                <input 
                    style="visibility:${option.correct_number !== null ? "visible" : "hidden"}"
                    class="livelike-voting-number-input correct-number-input ${option.correct_number !== option.number ? "red" : "green"}"
                    type="number" 
                    placeholder="-"
                    value="${option.correct_number}"
                    disabled
                />
            </div>
              </livelike-option>
    `;
        })}
  <livelike-footer class="${this.footerClass}">
  <button
                    class="predict-button"
                    style="visibility:${this.predictBtnVisibility}"
                    @click=${() => this.validateAndSubmitVote(this.options)}
                    ?disabled="${this.disabled || this.voteDisable || this.voteButtonDisabled}"
                  >Valider</button>
                  
                  </livelike-widget-footer>
                  </livelike-widget-body>
 </livelike-widget-root>
 <p id="draw_error" style="color: red; visibility:hidden">Draw! Select winner by clicking</p>
</template>
`;
    }
}
