function listenForClicks() {
    document.addEventListener("click", (e) => {
        const pattern = document.getElementById("patternInput").value;
        function sendMsg(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "open",
                pattern: pattern,
            });
        }
        function reportError(error) {
            console.error(`${error}`);
        }
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(sendMsg)
            .catch(reportError);
    });
}
function reportExecuteScriptError(error) {
    console.error(`Failed to execute content script: ${error.message}`);
}
browser.tabs
    .executeScript({ file: "openLinks.js" })
    .then(listenForClicks)
    .catch(reportExecuteScriptError);
