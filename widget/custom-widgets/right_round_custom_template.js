class RightRoundCustomImagePrediction extends BaseCustomImagePrediction {
}

customElements.define("round-custom-image-prediction", RightRoundCustomImagePrediction);
const rightCustomWidgetRenderer = (args) => {
    let widgetPayload = args.widgetPayload;
    if (widgetPayload.kind === 'image-number-prediction') {
        return document.createElement('round-custom-image-prediction');
    }
}