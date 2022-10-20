const scenarioFrame = document.querySelector('#scenarioFrame');

fetch('./scenarios/intro/index.html')
.then(response => response.text())
.then(html => {
    console.log(html);
    scenarioFrame.srcdoc = html;
    return html;
});
