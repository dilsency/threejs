// hold ctrl k then 0

export function generateReticleD()
{
    //
    var hudReticle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    hudReticle.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

    hudReticle.setAttribute("width", "36");
    hudReticle.setAttribute("height", "36");
    hudReticle.setAttribute("viewBox", "0 0 120 120");

    hudReticle.style.position = "fixed";
    hudReticle.style.zIndex = "2";
    hudReticle.style.top = "calc(50% - 12px)";
    hudReticle.style.left = "calc(50% - 12px)";
    hudReticle.style.display = "none";

    // the main ring
    var hudReticleCircleMainInline = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleMainInline.setAttribute("cx", "60");
    hudReticleCircleMainInline.setAttribute("cy", "60");
    hudReticleCircleMainInline.setAttribute("r", "36");
    hudReticleCircleMainInline.setAttribute("fill", "none");
    hudReticleCircleMainInline.setAttribute("stroke", "#00FF00");
    hudReticleCircleMainInline.setAttribute("stroke-width", "10");

    var hudReticleCircleMainOutlineA = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleMainOutlineA.setAttribute("cx", "60");
    hudReticleCircleMainOutlineA.setAttribute("cy", "60");
    hudReticleCircleMainOutlineA.setAttribute("r", "40");
    hudReticleCircleMainOutlineA.setAttribute("fill", "none");
    hudReticleCircleMainOutlineA.setAttribute("stroke", "#000000");
    hudReticleCircleMainOutlineA.setAttribute("stroke-width", "5");

    var hudReticleCircleMainOutlineB = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleMainOutlineB.setAttribute("cx", "60");
    hudReticleCircleMainOutlineB.setAttribute("cy", "60");
    hudReticleCircleMainOutlineB.setAttribute("r", "32");
    hudReticleCircleMainOutlineB.setAttribute("fill", "none");
    hudReticleCircleMainOutlineB.setAttribute("stroke", "#000000");
    hudReticleCircleMainOutlineB.setAttribute("stroke-width", "5");

    // dots

    // dot a
    var hudReticleCircleDotInnerA = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotInnerA.setAttribute("cx", "60");
    hudReticleCircleDotInnerA.setAttribute("cy", "104");
    hudReticleCircleDotInnerA.setAttribute("r", "12");
    hudReticleCircleDotInnerA.setAttribute("fill", "#90FF00");
    hudReticleCircleDotInnerA.setAttribute("class", "hud-reticle-dot hud-reticle-dot-a");

    var hudReticleCircleDotBackgroundInactiveA = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotBackgroundInactiveA.setAttribute("cx", "60");
    hudReticleCircleDotBackgroundInactiveA.setAttribute("cy", "104");
    hudReticleCircleDotBackgroundInactiveA.setAttribute("r", "14");
    hudReticleCircleDotBackgroundInactiveA.setAttribute("fill", "#000000");

    var hudReticleCircleDotBackgroundActiveA = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotBackgroundActiveA.setAttribute("cx", "60");
    hudReticleCircleDotBackgroundActiveA.setAttribute("cy", "104");
    hudReticleCircleDotBackgroundActiveA.setAttribute("r", "14");
    hudReticleCircleDotBackgroundActiveA.setAttribute("fill", "#000000");
    hudReticleCircleDotBackgroundActiveA.setAttribute("style", "display:none;");
    hudReticleCircleDotBackgroundActiveA.setAttribute("class",
        "hud-reticle-dot-background-active hud-reticle-dot-background-active-a");

    // dot b
    var hudReticleCircleDotInnerB = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotInnerB.setAttribute("cx", "16");
    hudReticleCircleDotInnerB.setAttribute("cy", "60");
    hudReticleCircleDotInnerB.setAttribute("r", "12");
    hudReticleCircleDotInnerB.setAttribute("fill", "#00FF00");
    hudReticleCircleDotInnerB.setAttribute("class", "hud-reticle-dot hud-reticle-dot-b");

    var hudReticleCircleDotBackgroundInactiveB = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotBackgroundInactiveB.setAttribute("cx", "16");
    hudReticleCircleDotBackgroundInactiveB.setAttribute("cy", "60");
    hudReticleCircleDotBackgroundInactiveB.setAttribute("r", "14");
    hudReticleCircleDotBackgroundInactiveB.setAttribute("fill", "#000000");

    var hudReticleCircleDotBackgroundActiveB = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotBackgroundActiveB.setAttribute("cx", "16");
    hudReticleCircleDotBackgroundActiveB.setAttribute("cy", "60");
    hudReticleCircleDotBackgroundActiveB.setAttribute("r", "14");
    hudReticleCircleDotBackgroundActiveB.setAttribute("fill", "#000000");
    hudReticleCircleDotBackgroundActiveB.setAttribute("style", "display:none;");
    hudReticleCircleDotBackgroundActiveB.setAttribute("class",
        "hud-reticle-dot-background-active hud-reticle-dot-background-active-b");

    // dot c
    var hudReticleCircleDotInnerC = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotInnerC.setAttribute("cx", "104");
    hudReticleCircleDotInnerC.setAttribute("cy", "60");
    hudReticleCircleDotInnerC.setAttribute("r", "12");
    hudReticleCircleDotInnerC.setAttribute("fill", "#00FF00");
    hudReticleCircleDotInnerC.setAttribute("class", "hud-reticle-dot hud-reticle-dot-c");

    var hudReticleCircleDotBackgroundInactiveC = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotBackgroundInactiveC.setAttribute("cx", "104");
    hudReticleCircleDotBackgroundInactiveC.setAttribute("cy", "60");
    hudReticleCircleDotBackgroundInactiveC.setAttribute("r", "14");
    hudReticleCircleDotBackgroundInactiveC.setAttribute("fill", "#000000");

    var hudReticleCircleDotBackgroundActiveC = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotBackgroundActiveC.setAttribute("cx", "104");
    hudReticleCircleDotBackgroundActiveC.setAttribute("cy", "60");
    hudReticleCircleDotBackgroundActiveC.setAttribute("r", "14");
    hudReticleCircleDotBackgroundActiveC.setAttribute("fill", "#000000");
    hudReticleCircleDotBackgroundActiveC.setAttribute("style", "display:none;");
    hudReticleCircleDotBackgroundActiveC.setAttribute("class",
        "hud-reticle-dot-background-active hud-reticle-dot-background-active-c");

    // dot d
    var hudReticleCircleDotInnerD = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotInnerD.setAttribute("cx", "60");
    hudReticleCircleDotInnerD.setAttribute("cy", "16");
    hudReticleCircleDotInnerD.setAttribute("r", "12");
    hudReticleCircleDotInnerD.setAttribute("fill", "#00FF00");
    hudReticleCircleDotInnerD.setAttribute("class", "hud-reticle-dot hud-reticle-dot-d");

    var hudReticleCircleDotBackgroundInactiveD = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotBackgroundInactiveD.setAttribute("cx", "60");
    hudReticleCircleDotBackgroundInactiveD.setAttribute("cy", "16");
    hudReticleCircleDotBackgroundInactiveD.setAttribute("r", "14");
    hudReticleCircleDotBackgroundInactiveD.setAttribute("fill", "#000000");

    var hudReticleCircleDotBackgroundActiveD = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleCircleDotBackgroundActiveD.setAttribute("cx", "60");
    hudReticleCircleDotBackgroundActiveD.setAttribute("cy", "16");
    hudReticleCircleDotBackgroundActiveD.setAttribute("r", "14");
    hudReticleCircleDotBackgroundActiveD.setAttribute("fill", "#000000");
    hudReticleCircleDotBackgroundActiveD.setAttribute("style", "display:none;");
    hudReticleCircleDotBackgroundActiveD.setAttribute("class",
        "hud-reticle-dot-background-active hud-reticle-dot-background-active-d");

    // append paths and circles
    // the order is extremely important
    hudReticle.appendChild(hudReticleCircleDotBackgroundInactiveA);
    hudReticle.appendChild(hudReticleCircleDotBackgroundInactiveB);
    hudReticle.appendChild(hudReticleCircleDotBackgroundInactiveC);
    hudReticle.appendChild(hudReticleCircleDotBackgroundInactiveD);
    hudReticle.appendChild(hudReticleCircleMainOutlineA);
    hudReticle.appendChild(hudReticleCircleMainOutlineB);
    hudReticle.appendChild(hudReticleCircleMainInline);
    hudReticle.appendChild(hudReticleCircleDotBackgroundActiveA);
    hudReticle.appendChild(hudReticleCircleDotBackgroundActiveB);
    hudReticle.appendChild(hudReticleCircleDotBackgroundActiveC);
    hudReticle.appendChild(hudReticleCircleDotBackgroundActiveD);
    hudReticle.appendChild(hudReticleCircleDotInnerA);
    hudReticle.appendChild(hudReticleCircleDotInnerB);
    hudReticle.appendChild(hudReticleCircleDotInnerC);
    hudReticle.appendChild(hudReticleCircleDotInnerD);


    // https://stackoverflow.com/a/42425397
    /*var hudReticlePath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    hudReticlePath.setAttribute("d", "M 50 10 A 40 40 0 1 0 50 90 A 40 40 0 1 0 50 10 Z M 50 30 A 20 20 0 1 1 50 70 A 20 20 0 1 1 50 30 Z");
    hudReticlePath.setAttribute("fill", "#00FF00");
    hudReticlePath.setAttribute("stroke", "#000000");
    hudReticlePath.setAttribute("stroke-width", "5");
    hudReticle.appendChild(hudReticlePath);*/
    
    // return object
    return {
        "hudReticle": hudReticle,
        "hudReticleFill": null,
        "hudReticleLines": null,
    }
}

export function generateReticleC()
{
    // another approach would be to use 2 paths and only 1 svg
    // and just use the correct path for the fill

    // for now we use 2 svgs, so we do not have to manually re-size the path
    
    //
    var hudReticle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    hudReticle.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

    hudReticle.setAttribute("width", "24");
    hudReticle.setAttribute("height", "24");
    hudReticle.setAttribute("viewBox", "0 0 24 24");

    hudReticle.style.position = "fixed";
    hudReticle.style.zIndex = "2";
    hudReticle.style.top = "calc(50% - 12px)";
    hudReticle.style.left = "calc(50% - 12px)";
    hudReticle.style.display = "none";

    //
    var hudReticleRadialGradientFill = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
    hudReticleRadialGradientFill.setAttribute("id", "radialGradientFill");
    hudReticleRadialGradientFill.setAttribute("cx", "0.5");
    hudReticleRadialGradientFill.setAttribute("cy", "0.45");
    hudReticleRadialGradientFill.setAttribute("fr", "5.00");

    const stopFill0 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stopFill0.setAttribute("offset", "95%");
    stopFill0.setAttribute("stop-color", "#000000CF");

    const stopFill1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stopFill1.setAttribute("offset", "100%");
    stopFill1.setAttribute("stop-color", "#00FF00FF");

    //
    hudReticleRadialGradientFill.appendChild(stopFill0);
    hudReticleRadialGradientFill.appendChild(stopFill1);
    hudReticle.appendChild(hudReticleRadialGradientFill);

    //
    var hudReticleRadialGradientStroke = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
    hudReticleRadialGradientStroke.setAttribute("id", "radialGradientStroke");
    hudReticleRadialGradientStroke.setAttribute("cx", "0.5");
    hudReticleRadialGradientStroke.setAttribute("cy", "0.45");
    hudReticleRadialGradientStroke.setAttribute("fr", "0.65");

    const stopStroke0 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stopStroke0.setAttribute("offset", "0%");
    stopStroke0.setAttribute("stop-color", "#00000090");

    const stopStroke1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stopStroke1.setAttribute("offset", "90%");
    stopStroke1.setAttribute("stop-color", "#000000FF");

    //
    hudReticleRadialGradientStroke.appendChild(stopStroke0);
    hudReticleRadialGradientStroke.appendChild(stopStroke1);
    hudReticle.appendChild(hudReticleRadialGradientStroke);

    //
    const scale = 0.7;
    const stringTransform = "scale(" + scale + " " + scale + "), translate(" + (24 - 24 * scale) + " " + (24 - 24 * scale) + ")";

    //
    var hudReticleGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    hudReticleGroup.setAttribute("transform", stringTransform);
    hudReticle.appendChild(hudReticleGroup);

    // https://iconmonstr.com/favorite-1-svg/
    var hudReticlePath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    hudReticlePath.setAttribute("d", "M12 4.435c-1.989-5.399-12-4.597-12 3.568 0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-8.118-10-8.999-12-3.568z");
    hudReticlePath.setAttribute("fill", "url('#radialGradientFill')");
    hudReticlePath.setAttribute("stroke", "url('#radialGradientStroke')");
    hudReticlePath.setAttribute("stroke-width", "3px");
    hudReticlePath.setAttribute("stroke-linecap", "butt");
    hudReticlePath.setAttribute("stroke-linejoin", "miter");
    hudReticlePath.setAttribute("paint-order", "stroke");
    hudReticleGroup.appendChild(hudReticlePath);

    //
    var hudReticleLines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    hudReticleLines.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

    hudReticleLines.setAttribute("width", "130");
    hudReticleLines.setAttribute("height", "6");
    hudReticleLines.setAttribute("viewBox", "0 0 130 6");
    
    hudReticleLines.style.position = "fixed";
    hudReticleLines.style.zIndex = "2";
    hudReticleLines.style.top = "calc(50% - 4px)";
    hudReticleLines.style.left = "calc(50% - (130px / 2))";
    hudReticleLines.style.display = "none";

    // left

    //
    var hudReticleLinesCircleLeftA = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleLinesCircleLeftA.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesCircleLeftA.setAttribute("r", "2.0");
    hudReticleLinesCircleLeftA.setAttribute("cx", "3.0");
    hudReticleLinesCircleLeftA.setAttribute("cy", "3.0");
    hudReticleLines.appendChild(hudReticleLinesCircleLeftA);

    //
    var hudReticleLinesLineLeft = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    hudReticleLinesLineLeft.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesLineLeft.setAttribute("y1", "3.0");
    hudReticleLinesLineLeft.setAttribute("y2", "3.0");

    hudReticleLinesLineLeft.setAttribute("x1", "6.0");
    hudReticleLinesLineLeft.setAttribute("x2", "27.0");
    hudReticleLines.appendChild(hudReticleLinesLineLeft);

    //
    var hudReticleLinesCircleLeftB = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleLinesCircleLeftB.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesCircleLeftB.setAttribute("r", "2.0");
    hudReticleLinesCircleLeftB.setAttribute("cx", "30.0");
    hudReticleLinesCircleLeftB.setAttribute("cy", "3.0");
    hudReticleLines.appendChild(hudReticleLinesCircleLeftB);
    
    // right

    const leftOffset = 99.0;

    //
    var hudReticleLinesCircleRightA = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleLinesCircleRightA.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesCircleRightA.setAttribute("r", "2.0");
    hudReticleLinesCircleRightA.setAttribute("cx", leftOffset);
    hudReticleLinesCircleRightA.setAttribute("cy", "3.0");
    hudReticleLines.appendChild(hudReticleLinesCircleRightA);

    //
    var hudReticleLinesLineRight = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    hudReticleLinesLineRight.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesLineRight.setAttribute("y1", "3.0");
    hudReticleLinesLineRight.setAttribute("y2", "3.0");

    hudReticleLinesLineRight.setAttribute("x1", leftOffset + 3);
    hudReticleLinesLineRight.setAttribute("x2", leftOffset + 25);
    hudReticleLines.appendChild(hudReticleLinesLineRight);

    //
    var hudReticleLinesCircleRightB = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleLinesCircleRightB.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesCircleRightB.setAttribute("r", "2.0");
    hudReticleLinesCircleRightB.setAttribute("cx", leftOffset + 28);
    hudReticleLinesCircleRightB.setAttribute("cy", "3.0");
    hudReticleLines.appendChild(hudReticleLinesCircleRightB);

    // return object
    return {
        "hudReticle": hudReticle,
        "hudReticleFill": null,
        "hudReticleLines": hudReticleLines,
    }
}

export function generateReticleA()
{
    // another approach would be to use 2 paths and only 1 svg
    // and just use the correct path for the fill

    // for now we use 2 svgs, so we do not have to manually re-size the path
    
    //
    var hudReticle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    hudReticle.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

    hudReticle.setAttribute("width", "24");
    hudReticle.setAttribute("height", "24");
    hudReticle.setAttribute("viewBox", "0 0 24 24");

    hudReticle.style.position = "fixed";
    hudReticle.style.zIndex = "2";
    hudReticle.style.top = "calc(50% - 12px)";
    hudReticle.style.left = "calc(50% - 12px)";
    hudReticle.style.display = "none";

    // https://iconmonstr.com/favorite-8-svg/
    var hudReticlePath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    hudReticlePath.setAttribute("d", "M17.867 3.493l4.133 3.444v5.127l-10 8.333-10-8.334v-5.126l4.133-3.444 5.867 3.911 5.867-3.911zm.133-2.493l-6 4-6-4-6 5v7l12 10 12-10v-7l-6-5z");
    hudReticlePath.setAttribute("fill", "#000000");
    hudReticle.appendChild(hudReticlePath);
    
    //
    var hudReticleFill = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    hudReticleFill.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

    hudReticleFill.setAttribute("width", "20");
    hudReticleFill.setAttribute("height", "20");
    hudReticleFill.setAttribute("viewBox", "0 0 24 24");

    hudReticleFill.style.position = "fixed";
    hudReticleFill.style.zIndex = "2";
    hudReticleFill.style.top = "calc(50% - 10px)";
    hudReticleFill.style.left = "calc(50% - 10px)";
    hudReticleFill.style.display = "none";

    // https://iconmonstr.com/favorite-7-svg/
    var hudReticleFillPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    hudReticleFillPath.setAttribute("d", "M18 1l-6 4-6-4-6 5v7l12 10 12-10v-7z");
    hudReticleFillPath.setAttribute("fill", "#00FF00");
    hudReticleFill.appendChild(hudReticleFillPath);

    //
    var hudReticleLines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    hudReticleLines.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

    hudReticleLines.setAttribute("width", "130");
    hudReticleLines.setAttribute("height", "6");
    hudReticleLines.setAttribute("viewBox", "0 0 130 6");
    
    hudReticleLines.style.position = "fixed";
    hudReticleLines.style.zIndex = "2";
    hudReticleLines.style.top = "calc(50% - 4px)";
    hudReticleLines.style.left = "calc(50% - (130px / 2))";
    hudReticleLines.style.display = "none";

    // left

    //
    var hudReticleLinesCircleLeftA = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleLinesCircleLeftA.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesCircleLeftA.setAttribute("r", "2.0");
    hudReticleLinesCircleLeftA.setAttribute("cx", "3.0");
    hudReticleLinesCircleLeftA.setAttribute("cy", "3.0");
    hudReticleLines.appendChild(hudReticleLinesCircleLeftA);

    //
    var hudReticleLinesLineLeft = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    hudReticleLinesLineLeft.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesLineLeft.setAttribute("y1", "3.0");
    hudReticleLinesLineLeft.setAttribute("y2", "3.0");

    hudReticleLinesLineLeft.setAttribute("x1", "6.0");
    hudReticleLinesLineLeft.setAttribute("x2", "27.0");
    hudReticleLines.appendChild(hudReticleLinesLineLeft);

    //
    var hudReticleLinesCircleLeftB = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleLinesCircleLeftB.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesCircleLeftB.setAttribute("r", "2.0");
    hudReticleLinesCircleLeftB.setAttribute("cx", "30.0");
    hudReticleLinesCircleLeftB.setAttribute("cy", "3.0");
    hudReticleLines.appendChild(hudReticleLinesCircleLeftB);
    
    // right

    const leftOffset = 99.0;

    //
    var hudReticleLinesCircleRightA = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleLinesCircleRightA.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesCircleRightA.setAttribute("r", "2.0");
    hudReticleLinesCircleRightA.setAttribute("cx", leftOffset);
    hudReticleLinesCircleRightA.setAttribute("cy", "3.0");
    hudReticleLines.appendChild(hudReticleLinesCircleRightA);

    //
    var hudReticleLinesLineRight = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    hudReticleLinesLineRight.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesLineRight.setAttribute("y1", "3.0");
    hudReticleLinesLineRight.setAttribute("y2", "3.0");

    hudReticleLinesLineRight.setAttribute("x1", leftOffset + 3);
    hudReticleLinesLineRight.setAttribute("x2", leftOffset + 25);
    hudReticleLines.appendChild(hudReticleLinesLineRight);

    //
    var hudReticleLinesCircleRightB = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    hudReticleLinesCircleRightB.setAttribute("style", "opacity:1;fill:none;fill-opacity:1;stroke:#000000E0;stroke-width:1.0;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal");
    hudReticleLinesCircleRightB.setAttribute("r", "2.0");
    hudReticleLinesCircleRightB.setAttribute("cx", leftOffset + 28);
    hudReticleLinesCircleRightB.setAttribute("cy", "3.0");
    hudReticleLines.appendChild(hudReticleLinesCircleRightB);

    // return object
    return {
        "hudReticle": hudReticle,
        "hudReticleFill": hudReticleFill,
        "hudReticleLines": hudReticleLines,
    }
}

export function generateReticleB(hudReticle)
{
    //
    hudReticle = document.createElement("div");
    hudReticle.style.position = "fixed";
    hudReticle.style.zIndex = "2";
    hudReticle.style.top = "calc(50% - 15px)";
    hudReticle.style.left = "calc(50% - 15px)";
    hudReticle.style.width = "30px";
    hudReticle.style.height = "30px";
    hudReticle.style.transform = "rotate(45deg)";
    hudReticle.style.display = "none";
    document.body.appendChild(hudReticle);
    //
    var hudReticleTop = document.createElement("div");
    hudReticleTop.style.position = "absolute";
    hudReticleTop.style.top = "0";
    hudReticleTop.style.left = "5px";
    hudReticleTop.style.background = "#00FF00";
    hudReticleTop.style.height = "5px";
    hudReticleTop.style.width = "20px";
    hudReticleTop.style.borderTop = "1px solid black";
    hudReticleTop.style.borderBottom = "1px solid black";
    hudReticle.appendChild(hudReticleTop);
    //
    var hudReticleBottom = document.createElement("div");
    hudReticleBottom.style.position = "absolute";
    hudReticleBottom.style.bottom = "0";
    hudReticleBottom.style.left = "5px";
    hudReticleBottom.style.background = "#00FF00";
    hudReticleBottom.style.height = "5px";
    hudReticleBottom.style.width = "20px";
    hudReticleBottom.style.borderTop = "1px solid black";
    hudReticleBottom.style.borderBottom = "1px solid black";
    hudReticle.appendChild(hudReticleBottom);
    //
    var hudReticleLeft = document.createElement("div");
    hudReticleLeft.style.position = "absolute";
    hudReticleLeft.style.top = "5px";
    hudReticleLeft.style.left = "0";
    hudReticleLeft.style.background = "#00FF00";
    hudReticleLeft.style.height = "20px";
    hudReticleLeft.style.width = "5px";
    hudReticleLeft.style.borderLeft = "1px solid black";
    hudReticleLeft.style.borderRight = "1px solid black";
    hudReticle.appendChild(hudReticleLeft);
    //
    var hudReticleRight = document.createElement("div");
    hudReticleRight.style.position = "absolute";
    hudReticleRight.style.top = "5px";
    hudReticleRight.style.right = "0";
    hudReticleRight.style.background = "#00FF00";
    hudReticleRight.style.height = "20px";
    hudReticleRight.style.width = "5px";
    hudReticleRight.style.borderLeft = "1px solid black";
    hudReticleRight.style.borderRight = "1px solid black";
    hudReticle.appendChild(hudReticleRight);
    //
    var hudReticleTopLeft = document.createElement("div");
    hudReticleTopLeft.style.position = "absolute";
    hudReticleTopLeft.style.top = "0";
    hudReticleTopLeft.style.left = "0";
    hudReticleTopLeft.style.background = "#00FF00";
    hudReticleTopLeft.style.height = "5px";
    hudReticleTopLeft.style.width = "5px";
    hudReticleTopLeft.style.borderTop = "1px solid black";
    hudReticleTopLeft.style.borderLeft = "1px solid black";
    hudReticle.appendChild(hudReticleTopLeft);
    //
    var hudReticleTopRight = document.createElement("div");
    hudReticleTopRight.style.position = "absolute";
    hudReticleTopRight.style.top = "0";
    hudReticleTopRight.style.right = "0";
    hudReticleTopRight.style.background = "#00FF00";
    hudReticleTopRight.style.height = "5px";
    hudReticleTopRight.style.width = "5px";
    hudReticleTopRight.style.borderTop = "1px solid black";
    hudReticleTopRight.style.borderRight = "1px solid black";
    hudReticle.appendChild(hudReticleTopRight);
    //
    var hudReticleBottomLeft = document.createElement("div");
    hudReticleBottomLeft.style.position = "absolute";
    hudReticleBottomLeft.style.bottom = "0";
    hudReticleBottomLeft.style.left = "0";
    hudReticleBottomLeft.style.background = "#00FF00";
    hudReticleBottomLeft.style.height = "5px";
    hudReticleBottomLeft.style.width = "5px";
    hudReticleBottomLeft.style.borderBottom = "1px solid black";
    hudReticleBottomLeft.style.borderLeft = "1px solid black";
    hudReticle.appendChild(hudReticleBottomLeft);
    //
    var hudReticleBottomRight = document.createElement("div");
    hudReticleBottomRight.style.position = "absolute";
    hudReticleBottomRight.style.bottom = "0";
    hudReticleBottomRight.style.right = "0";
    hudReticleBottomRight.style.background = "#00FF00";
    hudReticleBottomRight.style.height = "5px";
    hudReticleBottomRight.style.width = "5px";
    hudReticleBottomRight.style.borderBottom = "1px solid black";
    hudReticleBottomRight.style.borderRight = "1px solid black";
    hudReticle.appendChild(hudReticleBottomRight);
}

export function generateReticle()
{
    //
    return generateReticleD();
}

export function generateText(stringTextControls)
{
    //
    var hudTextControls = document.createElement("p");
    hudTextControls.style.position = "fixed";
    hudTextControls.style.zIndex = "2";

    hudTextControls.style.width = "100vw";
    hudTextControls.style.height = "100vh";
    hudTextControls.style.alignItems = "center";
    hudTextControls.style.justifyContent = "center";
    hudTextControls.style.top = "0";
    hudTextControls.style.right = "0";

    hudTextControls.style.textAlign = "center";
    hudTextControls.style.color = "black";
    hudTextControls.style.fontSize = "14px";
    hudTextControls.style.lineHeight = "16px";
    hudTextControls.style.whiteSpace = "pre-wrap";
    hudTextControls.style.fontFamily = "monospace";
    hudTextControls.style.display = "flex";
    hudTextControls.style.userSelect = "none";

    hudTextControls.style.webkitTextStroke = "3.0px black";
    hudTextControls.style.textStroke = "3.0px black";

    //document.body.appendChild(hudTextControls);

    //
    var hudTextControlsDouble = document.createElement("p");
    hudTextControlsDouble.style.position = "fixed";
    hudTextControlsDouble.style.zIndex = "3";

    hudTextControlsDouble.style.width = hudTextControls.style.width;
    hudTextControlsDouble.style.height = hudTextControls.style.height;
    hudTextControlsDouble.style.alignItems = hudTextControls.style.alignItems;
    hudTextControlsDouble.style.justifyContent = hudTextControls.style.justifyContent;
    hudTextControlsDouble.style.top = hudTextControls.style.top;
    hudTextControlsDouble.style.right = hudTextControls.style.right;

    hudTextControlsDouble.style.textAlign = "center";
    hudTextControlsDouble.style.color = "#FFFFFF";
    hudTextControlsDouble.style.fontSize = "14px";
    hudTextControlsDouble.style.lineHeight = "16px";
    hudTextControlsDouble.style.whiteSpace = "pre-wrap";
    hudTextControlsDouble.style.fontFamily = "monospace";
    hudTextControlsDouble.style.display = "flex";
    hudTextControlsDouble.style.userSelect = "none";

    hudTextControlsDouble.style.webkitTextStroke = "none";
    hudTextControlsDouble.style.textStroke = "none";
    
    //document.body.appendChild(hudTextControlsDouble);

    //
    hudTextControls.textContent = stringTextControls[0];
    hudTextControlsDouble.textContent = stringTextControls[0];

    //
    var hudTextStatus = document.createElement("p");
    hudTextStatus.style.position = "fixed";
    hudTextStatus.style.zIndex = "2";
    hudTextStatus.style.top = "4px";
    hudTextStatus.style.left = "4px";
    hudTextStatus.style.color = "black";
    hudTextStatus.style.fontSize = "14px";
    hudTextStatus.style.lineHeight = "16px";
    hudTextStatus.style.whiteSpace = "pre-wrap";
    hudTextStatus.style.fontFamily = "monospace";
    hudTextStatus.style.display = "flex";
    hudTextStatus.style.userSelect = "none";

    hudTextStatus.style.webkitTextStroke = "3.0px black";
    hudTextStatus.style.textStroke = "3.0px black";

    //document.body.appendChild(hudTextStatus);

    //
    var hudTextStatusDouble = document.createElement("p");
    hudTextStatusDouble.style.position = "fixed";
    hudTextStatusDouble.style.zIndex = "3";
    hudTextStatusDouble.style.top = "4px";
    hudTextStatusDouble.style.left = "4px";
    hudTextStatusDouble.style.color = "#FFFFFF";
    hudTextStatusDouble.style.fontSize = "14px";
    hudTextStatusDouble.style.lineHeight = "16px";
    hudTextStatusDouble.style.whiteSpace = "pre-wrap";
    hudTextStatusDouble.style.fontFamily = "monospace";
    hudTextStatusDouble.style.display = "flex";
    hudTextStatusDouble.style.userSelect = "none";

    hudTextStatusDouble.style.webkitTextStroke = "none";
    hudTextStatusDouble.style.textStroke = "none";
    
    //document.body.appendChild(hudTextStatusDouble);

    //
    var hudTextStack = document.createElement("p");
    hudTextStack.style.position = "fixed";
    hudTextStack.style.zIndex = "2";
    hudTextStack.style.bottom = "12px";
    hudTextStack.style.right = "24px";
    hudTextStack.style.color = "black";
    hudTextStack.style.fontSize = "14px";
    hudTextStack.style.lineHeight = "16px";
    hudTextStack.style.whiteSpace = "pre-wrap";
    hudTextStack.style.fontFamily = "monospace";
    hudTextStack.style.display = "flex";
    hudTextStack.style.userSelect = "none";

    hudTextStack.style.webkitTextStroke = "3.0px black";
    hudTextStack.style.textStroke = "3.0px black";

    //
    var hudTextStackDouble = document.createElement("p");
    hudTextStackDouble.style.position = "fixed";
    hudTextStackDouble.style.zIndex = "3";
    hudTextStackDouble.style.bottom = "12px";
    hudTextStackDouble.style.right = "24px";
    hudTextStackDouble.style.color = "#FFFFFF";
    hudTextStackDouble.style.fontSize = "14px";
    hudTextStackDouble.style.lineHeight = "16px";
    hudTextStackDouble.style.whiteSpace = "pre-wrap";
    hudTextStackDouble.style.fontFamily = "monospace";
    hudTextStackDouble.style.display = "flex";
    hudTextStackDouble.style.userSelect = "none";

    hudTextStackDouble.style.webkitTextStroke = "none";
    hudTextStackDouble.style.textStroke = "none";

    // return object
    return {
        "hudTextControls": hudTextControls,
        "hudTextControlsDouble": hudTextControlsDouble,

        "hudTextStatus": hudTextStatus,
        "hudTextStatusDouble": hudTextStatusDouble,

        "hudTextStack": hudTextStack,
        "hudTextStackDouble": hudTextStackDouble,
    };
}