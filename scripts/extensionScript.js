const goButton = document.getElementById("goButton");
const patternInput = document.getElementById("patternInput");
const useRegex = document.getElementById("useRegex");

const listenForClicks = () => {
    const reportError = (error) => {
        console.error(`${error}`);
    };
    goButton.addEventListener("click", () => {
        function sendMsg(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "openLinks",
                pattern: patternInput.value,
                useRegex: useRegex.checked,
            });
        }
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(sendMsg)
            .catch(reportError);
    });
    const pollLinks = () => {
        function sendMsg(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "getLinks",
                pattern: patternInput.value,
                useRegex: useRegex.checked,
            });
        }
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(sendMsg)
            .catch(reportError);
    };
    patternInput.addEventListener("input", pollLinks);
    useRegex.addEventListener("change", pollLinks);
};
const reportExecuteScriptError = (error) => {
    console.error(`Failed to execute content script: ${error.message}`);
};
browser.tabs
    .executeScript({ file: "scripts/openLinks.js" })
    .then(listenForClicks)
    .catch(reportExecuteScriptError);

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "links") {
        document.getElementById("linkCount").innerHTML = `Found ${
            message.links.length
        } link${message.links.length !== 1 ? "s" : ""}.`;
        document.getElementById("links").innerHTML = message.links
            .map((link) => {
                return `<a class="link" href="${link}">${link}</a>`;
            })
            .join("\n");
    }
});
