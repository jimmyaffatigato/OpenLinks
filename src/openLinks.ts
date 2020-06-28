interface FilterSettings {
    pattern: string;
    useRegex: boolean;
    ignoreCase: boolean;
    removeDuplicates: boolean;
}

if (!window["hasRun"]) {
    window["hasRun"] = true;
    const getLinks = (filterSettings: FilterSettings) => {
        const { pattern, useRegex, ignoreCase, removeDuplicates } = filterSettings;
        const linkElements = document.getElementsByTagName("a");
        let links = [] as string[];
        for (let i = 0; i < linkElements.length; i++) {
            links.push(linkElements[i].href);
        }
        if (removeDuplicates) {
            const set = new Set(links);
            links = [...set];
        }
        const matchingLinks = links.filter((link) => {
            if (useRegex) {
                return link.match(RegExp(pattern, `${ignoreCase ? "i" : ""}`));
            } else {
                if (ignoreCase) {
                    return link.toLowerCase().includes(pattern.toLowerCase());
                } else {
                    return link.includes(pattern);
                }
            }
        });
        return matchingLinks;
    };

    browser.runtime.onMessage.addListener(
        (message: { command: string; filterSettings: FilterSettings }, sender, sendResponse) => {
            if (message.command == "getLinks") {
                const { filterSettings } = message;
                sendResponse({ links: getLinks(filterSettings) });
            }
        }
    );
}
