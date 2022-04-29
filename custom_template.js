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

    

    render() {
        let index = 0
        let halfIndex = this.options.length / 2
        return html`
<template kind="text-prediction">
<livelike-widget-root class="custom-widget">
<livelike-widget-body>
${this.options.map((option, idx) => {
            index++
            let className = "livelike-option-end"
            if(index > halfIndex) {
                className = "livelike-option-start"
            } 
            return html`
            <livelike-option class=${className} style="${this.option_show}" index="${idx}">
            <livelike-image height="100px" width="100px"></livelike-image>
          <div style="display:none" class="livelike-voting-image-container">
            <livelike-description></livelike-description>
          </div>
              <div class="livelike-voting-input-container">
                <input 
                  class="livelike-voting-number-input user-number-input"
                  type="number" 
                  placeholder="-"
                  .value="${option.number}"
                  @input=${(e) => this.inputHandler(option, e)}
                  @keypress=${this.keypressHandler}
                  ?disabled="${this.disabled || this.voteDisable}"
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