// Elements
const goButton = document.getElementById("goButton") as HTMLButtonElement;
const patternInput = document.getElementById("patternInput") as HTMLInputElement;
const useRegex = document.getElementById("useRegex") as HTMLInputElement;
const ignoreCase = document.getElementById("ignoreCase") as HTMLInputElement;
const removeDuplicates = document.getElementById("removeDuplicates") as HTMLInputElement;
const version = document.getElementById("version") as HTMLAnchorElement;

// Manifest
const manifest = browser.runtime.getManifest();
version.textContent = `v${manifest.version}`;
version.href = manifest.homepage_url;

let links = [];

const openLinks = (links: string[]) => {
    links.forEach((link) => {
        browser.tabs.create({ url: link, active: false });
    });
};

const pollLinks = (): void => {
    const pattern = patternInput.value;
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs: browser.tabs.Tab[]) => {
        browser.tabs.sendMessage(tabs[0].id, {
            command: "getLinks",
            filterSettings: {
                pattern: pattern,
                useRegex: useRegex.checked,
                ignoreCase: ignoreCase.checked,
                removeDuplicates: removeDuplicates.checked,
            },
        });
    });
};

const listenForClicks = () => {
    goButton.addEventListener("click", (): void => {
        openLinks(links);
    });

    patternInput.addEventListener("input", pollLinks);
    useRegex.addEventListener("change", pollLinks);
    ignoreCase.addEventListener("change", pollLinks);
    removeDuplicates.addEventListener("change", pollLinks);
};
browser.tabs.executeScript({ file: "scripts/openLinks.js" }).then(listenForClicks);

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "links") {
        let color = Math.floor((message.links.length / 50) * 255);
        if (color > 255) {
            color = 255;
        }
        links = message.links;
        document.getElementById("linkCount").innerHTML = `Found <span style="${`color:#${color.toString(16)}0000`}">${
            message.links.length
        }</span> link${message.links.length !== 1 ? "s" : ""}.`;
        document.getElementById("links").innerHTML = message.links
            .map((link: string) => {
                return `<a class="link" title="${link}" href="${link}">${link}</a>`;
            })
            .join("\n");
    }
    if (message.command === "filter") {
        patternInput.value = message.pattern;
        useRegex.checked = message.useRegex;
        ignoreCase.checked = message.caseSensitive;
        removeDuplicates.checked = message.removeDuplicates;
        pollLinks();
    }
});
