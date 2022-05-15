class CustomImagePrediction extends LiveLikeNumberPrediction {

    option_show = "display:none";
    index = 0
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

    updateFollowUp = (updatedOptions) => {
        let index = 0
        updatedOptions.forEach(updatedOption =>{
            this.options[index++].correct_number = updatedOption.correct_number
        })
        this.requestUpdate();
    }

    validateAndSubmitVote = (options) => {
        let totalVotes = 0
        options.forEach(option => {
            totalVotes += option.number
        })

        let bestOfAttribute = this.widgetPayload.widget_attributes.find(function (element) {
            return element.key === 'bestOf'
        })

        let bestOfAttributeValue = 3
        if (bestOfAttribute !== null && bestOfAttribute !== undefined) {
            bestOfAttributeValue = bestOfAttribute.value
        }
        if (totalVotes == bestOfAttributeValue) {
            this.lockInVote(options)
        } else {
            alert("Vote Count needs to match " + bestOfAttributeValue)
        }

    }

    showOptions(show) {
        show ? this.option_show = "display:flex" : this.option_show = "display:none";
    }

    keypressHandler = e => e.which === 46 && (e.returnValue = false);

    inputHandler = (option,e) => {
        const idx = e.target.value.indexOf('.');
        idx !== -1 && (e.target.value = e.target.value.replace(/[.][0-9]+$/,""));
        const number = e.target.value ? +e.target.value : null
        this.updateOption(option,number);
      }
      
    getClassForOption(index, halfIndex) {
        let className = "livelike-option-end"
        if (index > halfIndex) {
            className = "livelike-option-start"
        }
        return className
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
        return html`
<template kind="text-prediction">
<livelike-widget-root class="${rootClassName}">
<livelike-widget-body>

${this.options.map((option, idx) => {
            index++
            let className = this.getClassForOption(index, halfIndex)
            const correct = option.number === option.correct_number;
            return html`
            <livelike-option class=${className} style="${this.option_show}" index="${idx}">
            <livelike-image height="80px" width="80px"></livelike-image>
              <div class="livelike-voting-input-container">
                <input 
                  class="livelike-voting-number-input user-number-input"
                  type="number" 
                  placeholder="-"
                  oninput="(!validity.rangeOverflow||(value=2)) && (!validity.rangeUnderflow||(value=1)) &&
                  (!validity.stepMismatch||(value=parseInt(this.value)));"
                  .value="${option.number}"
                  min="1" 
                  max="2"
                  maxlength="1"
                  @keypress=${this.keypressHandler}
                  @input=${(e) => this.inputHandler(option, e)}
                  ?disabled="${this.disabled || this.voteDisable}"
                />
              
                <input 
                    class="livelike-voting-number-input correct-number-input"
                    type="number" 
                    placeholder="-"
                    value="${option.correct_number}"
                    disabled
                />
            </div>
              </livelike-option>
    `;
        })}
  <livelike-footer>
  <button
                    class="predict-button"
                    @click=${() => this.validateAndSubmitVote(this.options)}
                    ?disabled="${this.disabled || this.voteDisable || this.voteButtonDisabled}"
                  >${this.owner.localize("widget.numberPrediction.voteButton.label")}</button>
                  ${this.disabled && (this.vote || this.interaction) ? html`<span class="voted-text">${this.owner.localize("widget.numberPrediction.votedText")}</span>` : null}  
                  </livelike-widget-footer>
                  </livelike-widget-body>
</livelike-widget-root>
</template>
`;
    }
}
customElements.define("custom-image-prediction", CustomImagePrediction);

const customWidgetRenderer = (args) => {
    let widgetPayload = args.widgetPayload;
    if (widgetPayload.kind === 'image-number-prediction') {
        return document.createElement('custom-image-prediction');
    }
}