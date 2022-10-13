const scenarioFrame = document.querySelector('#scenarioFrame');

fetch('./scenarios/lunoids/index.html')
.then(response => response.text())
.then(html => {
    console.log(html);
    scenarioFrame.srcdoc = html;
    return html;
});