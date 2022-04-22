class CustomImagePrediction extends LiveLikePrediction {
    render() {
        return html`
<template kind="text-prediction">
<livelike-widget-root class="custom-widget">
<livelike-widget-header class="widget-header" slot="header">
<livelike-timer class="custom-timer"></livelike-timer>
<livelike-title class="custom-title"></livelike-title>
</livelike-widget-header>
<livelike-widget-body>
<livelike-select>
<template>
<livelike-option style="display:none">
<div style="width:100%;display:flex;align-items:center;">
<livelike-description></livelike-description>
</div>
</livelike-option>
</template>
</livelike-select>
</livelike-widget-body>
</livelike-widget-root>
</template>
`;
    }
}
customElements.define("custom-image-prediction", CustomImagePrediction);

const customWidgetRenderer = (args) => {
    let widgetPayload = args.widgetPayload;
    if (widgetPayload.kind === 'text-prediction' && !isInitialRound(widgetPayload)) {
        return document.createElement('custom-image-prediction');
    }
}