interface FilterSettings {
    pattern: string;
    useRegex: boolean;
    ignoreCase: boolean;
    removeDuplicates: boolean;
}

browser.browserAction.setBadgeBackgroundColor({ color: "#ffffff" });

// Elements
const openLinksButton = document.getElementById("goButton") as HTMLButtonElement;
const patternInput = document.getElementById("patternInput") as HTMLInputElement;
const useRegexCheckbox = document.getElementById("useRegex") as HTMLInputElement;
const ignoreCaseCheckbox = document.getElementById("ignoreCase") as HTMLInputElement;
const removeDuplicatesCheckbox = document.getElementById("removeDuplicates") as HTMLInputElement;
const test = document.getElementById("test") as HTMLSpanElement;
const version = document.getElementById("version") as HTMLAnchorElement;

// Manifest
const manifest = browser.runtime.getManifest();
version.textContent = `v${manifest.version}`;
version.href = manifest.homepage_url;
browser.storage.local.get({ runs: 0 }).then((result) => {
    const oldRuns = result.runs;
    test.textContent = oldRuns;
    browser.storage.local.set({ runs: oldRuns + 1 });
});

let links = [];

const openLinks = (links: string[]) => {
    links.forEach((link) => {
        browser.tabs.create({ url: link, active: false });
    });
};

const saveFilter = () => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs: browser.tabs.Tab[]) => {
        const tab = tabs[0];
        browser.storage.local.set({
            [String(tab.id)]: {
                pattern: patternInput.value,
                useRegex: useRegexCheckbox.checked,
                ignoreCase: ignoreCaseCheckbox.checked,
                removeDuplicates: removeDuplicatesCheckbox.checked,
            },
        });
    });
};

const pollLinks = (): void => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs: browser.tabs.Tab[]) => {
        const tab = tabs[0];
        browser.tabs.sendMessage(tab.id, {
            command: "getLinks",
            filterSettings: {
                pattern: patternInput.value,
                useRegex: useRegexCheckbox.checked,
                ignoreCase: ignoreCaseCheckbox.checked,
                removeDuplicates: removeDuplicatesCheckbox.checked,
            },
        });
    });
};

browser.tabs.executeScript({ file: "scripts/openLinks.js" }).then(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs: browser.tabs.Tab[]) => {
        const tab = tabs[0];
        browser.storage.local
            .get({
                [String(tab.id)]: { pattern: "", useRegex: false, ignoreCase: false, removeDuplicates: false },
            })
            .then((result) => {
                console.log(result);
                const { pattern, useRegex, ignoreCase, removeDuplicates } = result[String(tab.id)]
                    ? result[String(tab.id)]
                    : { pattern: "", useRegex: false, ignoreCase: false, removeDuplicates: false };
                patternInput.value = pattern;
                useRegexCheckbox.checked = useRegex;
                ignoreCaseCheckbox.checked = ignoreCase;
                removeDuplicatesCheckbox.checked = removeDuplicates;
                pollLinks();
            });
    });
});

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "links") {
        let r = Math.floor((message.links.length / 50) * 255);
        if (r > 255) {
            r = 255;
        }
        const color = `#${r.toString(16)}0000`;
        links = message.links;
        document.getElementById("linkCount").innerHTML = `Found <span style="color:${color}">${
            message.links.length
        }</span> link${message.links.length !== 1 ? "s" : ""}.`;
        document.getElementById("links").innerHTML = message.links
            .map((link: string) => {
                return `<a class="link" title="${link}" href="${link}">${link}</a>`;
            })
            .join("\n");
        browser.browserAction.setBadgeText({ text: String(links.length) });
        browser.browserAction.setBadgeTextColor({ color: color });
    }
});

openLinksButton.addEventListener("click", () => {
    openLinks(links);
});
patternInput.addEventListener("input", () => {
    saveFilter();
    pollLinks();
});
useRegexCheckbox.addEventListener("change", () => {
    saveFilter();
    pollLinks();
});
ignoreCaseCheckbox.addEventListener("change", () => {
    saveFilter();
    pollLinks();
});
removeDuplicatesCheckbox.addEventListener("change", () => {
    saveFilter();
    pollLinks();
});
