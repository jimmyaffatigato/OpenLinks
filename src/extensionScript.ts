const goButton = document.getElementById("goButton") as HTMLButtonElement;
const patternInput = document.getElementById("patternInput") as HTMLInputElement;
const useRegex = document.getElementById("useRegex") as HTMLInputElement;
const caseSensitive = document.getElementById("caseSensitive") as HTMLInputElement;

let links = [];

const openLinks = (links: string[]) => {
    links.forEach((link) => {
        browser.tabs.create({ url: link, active: false });
    });
};

const pollLinks = (): void => {
    const pattern = patternInput.value;
    function sendMsg(tabs: browser.tabs.Tab[]) {
        browser.tabs.sendMessage(tabs[0].id, {
            command: "getLinks",
            pattern: pattern,
            useRegex: useRegex.checked,
            caseSensitive: caseSensitive.checked,
        });
    }
    browser.tabs.query({ active: true, currentWindow: true }).then(sendMsg);
};

const listenForClicks = () => {
    goButton.addEventListener("click", (): void => {
        openLinks(links);
    });

    patternInput.addEventListener("input", pollLinks);
    useRegex.addEventListener("change", pollLinks);
    caseSensitive.addEventListener("change", pollLinks);
};
browser.tabs.executeScript({ file: "scripts/openLinks.js" }).then(listenForClicks);

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "links") {
        links = message.links;
        document.getElementById("linkCount").innerHTML = `Found ${message.links.length} link${
            message.links.length !== 1 ? "s" : ""
        }.`;
        document.getElementById("links").innerHTML = message.links
            .map((link) => {
                return `<a class="link" href="${link}">${link}</a>`;
            })
            .join("\n");
    }
    if (message.command === "filter") {
        patternInput.value = message.pattern;
        useRegex.checked = message.useRegex;
        caseSensitive.checked = message.caseSensitive;
        pollLinks();
    }
});