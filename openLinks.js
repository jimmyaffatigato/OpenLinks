console.log("Testing: yes?");

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
    if (message.command === "open") {
        if (message.pattern != "") {
            const regex = new RegExp(message.pattern);
            openLinks(regex);
            console.log(`Opening all links matching /${message.pattern}/.`);
        }
    }
    if (message.command === "msg") {
        console.log("yess");
    }
});
