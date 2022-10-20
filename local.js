const scenarioFrame = document.querySelector('#scenarioFrame');

const defaultScenarioSender = "no-reply@resolutions.rescorp";
const missingScenarioUrl = "./scenarios/blankScenario.html";

/**
 * @typedef {Object} Scenario
 * @property {string} name - The name of the scenario
 * @property {string} description - The short description of the scenario to show in the inbox
 * @property {string} url - The url of the scenario
 * @property {string} sender - The sender of the scenario (defaults to defaultScenarioSender)
 * @property {boolean} shown - Whether the scenario should be shown in the inbox (defaults to false)
 * @property {boolean} completed - Whether the scenario has been completed (defaults to false)
 * @property {boolean} completed - Whether the scenario has been completed (defaults to false)
 */

/**
 * @type {Scenario[]}
 */
const scenarios = [
    {
        name: 'intro',
        description: 'Welcome to the Resolutions Corporation. This is your first scenario. Click here to start.',
        url: './scenarios/intro/index.html',
        sender: defaultScenarioSender,
        shown: true,
        completed: false
    },
    {
        name: 'lunoids',
        description: 'Moronic creatures that produce excellent milk need your help!',
        url: './scenarios/lunoids/index.html',
        sender: defaultScenarioSender,
        shown: true,
        completed: false
    },
];

let currentScenario = null;

/**
 * @summary Loads the scenario with the given name
 * @param url {string|Scenario.url} The url of the scenario to load Scenario.url
 */
const loadScenario = function(url)
{
    const nextScenario = scenarios.find(scenario => scenario.url === url);
    if (nextScenario)
    {
        currentScenario = nextScenario;
        fetch(nextScenario.url)
        .then(response => response.text())
        .then(html =>
        {
            // console.log('loaded scenario', nextScenario.name, html);
            scenarioFrame.srcdoc = html;
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadScenario(missingScenarioUrl);
    
    // get a list of scenarios that are shown
    const shownScenarios = scenarios.filter(scenario => scenario.shown);

    // rplc8 list of shownScenarios into #inbox
    const inbox = sleepless.rplc8("#r8_scenario");

    inbox.update(shownScenarios, function(element, data, index)
    {
        // add completed class if scenario is completed
        if (data.completed)
        {
            element.classList.add('completed');
        }
        
        // add event listener to each scenario in the inbox to load the scenario when clicked
        element.addEventListener('click', () =>
        {
            sleepless.QS('#inbox .scenario').forEach(scenario => scenario.classList.remove('active'));
            // console.log(element, data);
            loadScenario(data?.url || missingScenarioUrl);
            element.classList.add('active');
        });
    });
});

