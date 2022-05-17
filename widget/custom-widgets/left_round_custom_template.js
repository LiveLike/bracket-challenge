class LeftCustomImagePrediction extends BaseCustomImagePrediction {

    semiFinalImage= "assets/semi_1.png"
    semiFinalImageClass= "semi_1"
    footerClass = "livelike-footer"

    getSemiFinalImageTag() {
        return "<img style=\"display:${this.widgetPayload.isSemiFinal == true ? \"block\":\"none\"}\" id=\"semi_1\" src=\"assets/semi_1.png\">"
    }

    getInputContainerClass() {
        return "left-livelike-voting-input-container"
    }


    getFlexDirectionForRoot() {
        return "flex-direction:row"
    }

    getClassForOption(index, halfIndex) {
        let className = "left-livelike-option-end"
        if (index > halfIndex) {
            className = "left-livelike-option-start"
        }
        return className
    }
}

customElements.define("left-custom-image-prediction", LeftCustomImagePrediction);

const leftPanelCustomWidgetRenderer = (args) => {
    let widgetPayload = args.widgetPayload;
    if (widgetPayload.kind === 'image-number-prediction') {
        return document.createElement('left-custom-image-prediction');
    }
}