const getLinks = (pattern) => {
    const as = document.getElementsByTagName("a");
    let links = [];
    for (let a of as) {
        links.push(a.href);
    }
    const set = new Set(links);
    return [...set].filter((link) => {
        return link.match(pattern);
    });
};

const openLinks = (pattern) => {
    const as = document.getElementsByTagName("a");
    let links = [];
    for (let a of as) {
        links.push(a.href);
    }
    const set = new Set(links);
    links = [...set];
    links.forEach((link) => {
        link.match(pattern) ? window.open(link, "_blank") : {};
    });
};

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "getLinks") {
        if (message.useRegex) {
            browser.runtime.sendMessage({
                command: "links",
                links: getLinks(new RegExp(message.pattern)),
            });
        } else {
            browser.runtime.sendMessage({
                command: "links",
                links: getLinks(message.pattern),
            });
        }
        const links = getLinks(message.pattern);
        browser.runtime.sendMessage({ command: "links", links: links });
    }
    if (message.command === "openLinks") {
        if (message.pattern != "") {
            if (message.useRegex) {
                openLinks(new RegExp(message.pattern));
                console.log(
                    `Opening all links matching RegEx: /${message.pattern}/.`
                );
            } else {
                openLinks(message.pattern);
                console.log(
                    `Opening all links matching string: ${message.pattern}.`
                );
            }
        }
    }
});

const links = getLinks("");
browser.runtime.sendMessage({ command: "links", links: links });
