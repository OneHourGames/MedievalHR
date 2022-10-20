const scenarioFrame = document.querySelector('#scenarioFrame');

const defaultScenarioSender = "RESCorp Resolutions";
const missingScenarioUrl = "./scenarios/blankScenario.html";

// rplc8 list of shownScenarios into #inbox
const inbox = sleepless.rplc8("#r8_scenario");

/**
 * @typedef {Object} Scenario
 * @property {string} name - The name of the scenario
 * @property {string} description - The short description of the scenario to show in the inbox
 * @property {string} url - The url of the scenario
 * @property {string} sender - The sender of the scenario (defaults to defaultScenarioSender)
 * @property {boolean} shown - Whether the scenario should be shown in the inbox (defaults to false)
 * @property {boolean} completed - Whether the scenario has been completed (defaults to false)
 * @property {boolean} read - Whether the scenario has been clicked on (defaults to false)
 */

/**
 * @type {Scenario[]}
 */
const scenarios = [
    {
        name: 'Welcome to RESCorp Resolutions',
        description: 'You will need to sign a few documents before you can start working.',
        url: './scenarios/intro/index.html',
        sender: defaultScenarioSender,
        shown: true,
        completed: false,
        read: false,
    },
    {
        name: 'lunoids',
        description: 'Moronic creatures that produce excellent milk need your help!',
        url: './scenarios/lunoids/index.html',
        sender: defaultScenarioSender,
        shown: false,
        completed: false,
        read: false,
    },
    {
        name: 'The Great Escape',
        description: 'You are a prisoner on a space station. You need to escape!',
        url: './scenarios/theGreatEscape/index.html',
        sender: "Bob Abadacass",
        shown: false,
        read: false,
        completed: false,
    }
];

const getGameSave = function()
{
    const gameSave = localStorage.getItem('gameSave');
    
    let parsedGameSave = scenarios;
    if (gameSave && gameSave !== 'undefined')
    {
        // add any new scenarios to the end of the existing game save
        parsedGameSave = JSON.parse(gameSave);
        if(parsedGameSave.length < scenarios.length)
        {
            parsedGameSave.push(...scenarios.slice(parsedGameSave.length));
        }
    }
    
    saveGame(parsedGameSave);
    return JSON.parse(localStorage.getItem('gameSave'));
}

const saveGame = function(game)
{
    if(!game)
    {
        return false;
    }
    localStorage.setItem('gameSave', JSON.stringify(game));
}

/**
 * @summary Loads the scenario with the given name
 * @param url {string|Scenario.url} The url of the scenario to load Scenario.url
 */
const loadScenario = function(url)
{
    const nextScenario = getGameSave().find(scenario => scenario.url === url);
    // console.log('loading next scenario', nextScenario);
    if (nextScenario)
    {
        fetch(nextScenario.url)
        .then(response => response.text())
        .then(html =>
        {
            // console.log('loaded scenario', nextScenario.name, html);
            const scenarioInjectionHtml = 
            `
                const currentScenario = ${JSON.stringify(nextScenario)};
                const completeCurrentScenario = function()
                {
                    window.parent.postMessage({
                        action: "completeScenario",
                        scenario: ${JSON.stringify(nextScenario)},
                    }, "*");
                }
            `;
            
            html = html.replace(/__inject__/g, scenarioInjectionHtml);
            // console.log(html);
            scenarioFrame.srcdoc = html;
            // scenarioFrame.contentWindow.postMessage({action: "setCurrentScenario", currentScenario: nextScenario}, '*');
            
            const gameSave = getGameSave();
        });

        updateInbox();
    }
}

const updateInbox = function()
{
    const gameSave = getGameSave();
    const shownScenarios = gameSave.filter(scenario => scenario.shown).reverse();
    
    // console.log('shownScenarios', shownScenarios);
    inbox.update(shownScenarios, function(element, data, index)
    {
        // add completed class if scenario is completed
        if (data.completed)
        {
            element.classList.add('completed');
        }

        // add isRead class if scenario is read
        if (data.read)
        {
            element.classList.add('isRead');
        }

        // add event listener to each scenario in the inbox to load the scenario when clicked
        element.addEventListener('click', () =>
        {
            // console.log(`clicked on scenario ${data.name}`);
            
            data.read = true;
            element.classList.add('isRead');
            element.classList.add('active');

            saveGame(gameSave);
            loadScenario(data?.url || missingScenarioUrl);
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    
    // get a list of scenarios that are shown
    const gameSave = getGameSave();
    const shownScenarios = gameSave.filter(scenario => scenario.shown);
    
    // get the next uncompleted scenario that is also shown
    
    updateInbox();
});


/**
 * @summary Marks the current scenario as completed, then loads the next scenario that is shown and not completed yet
 */
const loadNextScenario = function(currentScenario)
{
    const gameSave = getGameSave();
    const currentScenarioFromGameSave = gameSave.find(scenario => scenario.url === currentScenario.url);
    
    // console.log(currentScenarioFromGameSave);
    
    if(currentScenario && currentScenarioFromGameSave)
    {
        currentScenarioFromGameSave.completed = true;
        saveGame(gameSave);
    }

    const nextScenario = gameSave.find(scenario => scenario.shown === false && scenario.completed === false );
    if(nextScenario)
    {
        nextScenario.shown = true;
    }

    saveGame(gameSave);
    updateInbox();
    loadScenario(currentScenario?.url);
}


window.addEventListener('message', (message) => {
    
    const action = message.data?.action || null;
    const scenario = message.data?.scenario || null;
    
    if (action)
    {
        if(!scenario)
        {
            console.error('No scenario specified');
            return false;
        }

        // console.log(action, message);
        if (action === 'completeScenario')
        {
            loadNextScenario(scenario);
        }
    }
});