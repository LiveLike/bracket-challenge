class BaseCustomImagePrediction extends LiveLikeNumberPrediction {

    option_show = "display:none";
    predictBtnVisibility = "hidden"
    index = 0
    semiFinalImage = "assets/semi_2.png"
    semiFinalImageClass = "semi_2"
    footerClass = "right-livelike-footer"
   
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

    validateAndSubmitVote = (options) => {
        let maxVote = options[0].number
        let totalVotes = 0
        options.forEach(option => {
            if (maxVote < option.number) {
                maxVote = option.number
            }
            totalVotes += option.number
        })

        let bestOfAttributeValue = this.getBestOfValueFromWidget()
        let maxVotesNeeded = Math.ceil(bestOfAttributeValue / 2)
        if (maxVote == maxVotesNeeded && totalVotes <= bestOfAttributeValue) {
            this.lockInVote(options)
            this.showInputBoxError(false)
        } else {
            this.showInputBoxError(true)
            
        }

    }

    showInputBoxError(show) {
        let errorElement = document.getElementById('validation_error')
        
        if(show) {
            errorElement.classList.add('show')
        } else {
            errorElement.classList.remove('show')
        }

        if(show) {
            document.getElementById('error_content').innerHTML = "Vote Count needs to match " + this.getBestOfValueFromWidget()
            
        }
        
    }
    
    showOptions(show) {
        show ? this.option_show = "display:flex" : this.option_show = "display:none";
        if (show) {
            this.showPredictionButton()
        }

    }

    getBestOfValueFromWidget() {
        let bestOfAttribute = this.widgetPayload.widget_attributes.find(function (element) {
            return element.key === 'bestOf'
        })

        let bestOfAttributeValue = 3
        if (bestOfAttribute !== null && bestOfAttribute !== undefined) {
            bestOfAttributeValue = parseInt(bestOfAttribute.value)
        }
        return bestOfAttributeValue
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
        this.updateOption(option, number);
    }

    getClassForOption(index, halfIndex) {
        let className = "livelike-option-end"
        if (index > halfIndex) {
            className = "livelike-option-start"
        }
        return className
    }

    getFlexDirectionForRoot() {
        return "flex-direction:row-reverse"
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

        let bestOfAttributeValue = this.getBestOfValueFromWidget()
        let maxVotesNeeded = Math.ceil(bestOfAttributeValue / 2)

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
            <livelike-image height="55px" width="55px"></livelike-image>
              <div class=${this.getInputContainerClass()}>
                <input 
                  class="livelike-voting-number-input user-number-input"
                  type="number" 
                  placeholder="-"
                  oninput="(!validity.rangeOverflow||(value=${maxVotesNeeded})) && (!validity.rangeUnderflow||(value=0)) &&
                  (!validity.stepMismatch||(value=parseInt(this.value)));"
                  .value="${option.number}"
                  min="0" 
                  max="2"
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
</template>
`;
    }
}
