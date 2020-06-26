(() => {
    const getLinks = (pattern, caseSensitive) => {
        const linkElements = document.getElementsByTagName("a");
        let links = [];
        for (let i = 0; i < linkElements.length; i++) {
            links.push(linkElements[i].href);
        }
        const set = new Set(links);
        const matchingLinks = [...set].filter((link) => {
            if (typeof pattern == "string") {
                if (caseSensitive) {
                    return link.includes(pattern);
                }
                else {
                    return link.toLowerCase().includes(pattern.toLowerCase());
                }
            }
            return link.match(pattern);
        });
        return matchingLinks;
    };
    const sendLinks = (links) => {
        browser.runtime.sendMessage({
            command: "links",
            links: links,
        });
    };
    browser.runtime.onMessage.addListener((message) => {
        const { command, pattern, useRegex, caseSensitive } = message;
        localStorage.setItem("filter", JSON.stringify({ pattern, useRegex, caseSensitive }));
        if (command === "getLinks") {
            sendLinks(getLinks(useRegex ? new RegExp(pattern) : pattern, caseSensitive));
        }
    });
    const storedFilter = localStorage.getItem("filter");
    if (storedFilter) {
        const filter = JSON.parse(storedFilter);
        browser.runtime.sendMessage({ command: "filter", ...filter });
    }
    else {
        browser.runtime.sendMessage({
            command: "filter",
            pattern: "",
            useRegex: false,
            caseSensitive: false,
        });
    }
})();
