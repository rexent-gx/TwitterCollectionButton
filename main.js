function insertIcon() {
    const containerElements = document.querySelectorAll("[data-testid='tweet'] [role='group']");
    containerElements.forEach(iconContainer => {
        if (!iconContainer.children.namedItem("collection")) {
            const clone = iconContainer.lastChild.cloneNode(true);
            if (clone instanceof Element) {
                clone.setAttribute("name", "collection")
                const el = clone.querySelector("svg");
                el.outerHTML = `<svg class="collection-button" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 14V20M14 17H20M15.6 10H18.4C18.9601 10 19.2401 10 19.454 9.89101C19.6422 9.79513 19.7951 9.64215 19.891 9.45399C20 9.24008 20 8.96005 20 8.4V5.6C20 5.03995 20 4.75992 19.891 4.54601C19.7951 4.35785 19.6422 4.20487 19.454 4.10899C19.2401 4 18.9601 4 18.4 4H15.6C15.0399 4 14.7599 4 14.546 4.10899C14.3578 4.20487 14.2049 4.35785 14.109 4.54601C14 4.75992 14 5.03995 14 5.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10ZM5.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V5.6C10 5.03995 10 4.75992 9.89101 4.54601C9.79513 4.35785 9.64215 4.20487 9.45399 4.10899C9.24008 4 8.96005 4 8.4 4H5.6C5.03995 4 4.75992 4 4.54601 4.10899C4.35785 4.20487 4.20487 4.35785 4.10899 4.54601C4 4.75992 4 5.03995 4 5.6V8.4C4 8.96005 4 9.24008 4.10899 9.45399C4.20487 9.64215 4.35785 9.79513 4.54601 9.89101C4.75992 10 5.03995 10 5.6 10ZM5.6 20H8.4C8.96005 20 9.24008 20 9.45399 19.891C9.64215 19.7951 9.79513 19.6422 9.89101 19.454C10 19.2401 10 18.9601 10 18.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14H5.6C5.03995 14 4.75992 14 4.54601 14.109C4.35785 14.2049 4.20487 14.3578 4.10899 14.546C4 14.7599 4 15.0399 4 15.6V18.4C4 18.9601 4 19.2401 4.10899 19.454C4.20487 19.6422 4.35785 19.7951 4.54601 19.891C4.75992 20 5.03995 20 5.6 20Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                clone.addEventListener("mouseover", () => { clone.querySelector(".collection-button").style.filter = "brightness(150%)" });
                clone.addEventListener("mouseleave", () => { clone.querySelector(".collection-button").style = null });
                clone.addEventListener("click", async () => {
                    await buttonClick(iconContainer.closest("[data-testid='tweet']").querySelector("time").parentElement.href, clone.querySelector(".collection-button > path"));
                })
            }
            iconContainer.lastChild.before(clone);
        }
    })
}

async function overrideCookies(ct0, authToken, isDebug) {
    const currentct0 = await browser.runtime.sendMessage(JSON.stringify({ command: "getCookie", name: "ct0" }));
    const setct0 = await browser.runtime.sendMessage(JSON.stringify({
        command: "setCookie",
        cookie: {
            ...currentct0,
            value: ct0
        }
    }));
    if (isDebug)
        console.debug("Override:", setct0);

    const currentauthToken = await browser.runtime.sendMessage(JSON.stringify({ command: "getCookie", name: "auth_token" }));
    const setauthToken = await browser.runtime.sendMessage(JSON.stringify({
        command: "setCookie",
        cookie: {
            ...currentauthToken,
            value: authToken
        }
    }));
    if (isDebug)
        console.debug("Override:", setauthToken);

    return ({ ct0: currentct0.value, authToken: currentauthToken.value })
}

async function buttonClick(url, buttonEl) {
    const colors = { default: "", added: "rgb(0, 160, 64)", error: "rgb(182, 30, 34)" };
    const settings = await browser.storage.sync.get(["collectionId", "authorization", "authToken", "ct0", "debug"]);
    if (!settings.collectionId) {
        console.error("Collection ID is not configured. Set ID by addon's option and try again.");
        return;
    }

    let receive = await browser.runtime.sendMessage(JSON.stringify({ command: "getCookies" }));
    if (settings.debug)
        console.debug("Recv:", receive);

    if (buttonEl.style.stroke == colors.default) {
        // Override cookies if configured
        let currentValues;
        if (settings.ct0 && settings.authToken)
            currentValues = await overrideCookies(settings.ct0, settings.authToken, settings.debug);

        const request = new Request(`https://api.twitter.com/1.1/collections/entries/add.json?tweet_id=${url.replace(/\/+$/, "").split("/").pop()}&id=custom-${settings.collectionId}`, {
            method: "POST",
            headers: {
                "authorization": settings.authorization,
                "X-Csrf-Token": settings.ct0 ? settings.ct0 : receive.XCsrfToken
            }
        });
        if (settings.debug)
            console.debug("Req:", request);

        const response = await fetch(request);
        if (settings.debug)
            console.debug("Res:", response);
        if (!response.ok) {
            response.json().then(data => {
                console.error(`${response.status} ${response.statusText} from ${request.url}\n${data.errors[0].message}`);
                buttonEl.style.stroke = colors.error;
                setTimeout(() => {
                    buttonEl.style = null;
                }, 2000);
            });
        }
        else {
            buttonEl.style.stroke = colors.added;
        }

        // Restore cookies if it needs
        if (currentValues)
            await overrideCookies(currentValues.ct0, currentValues.authToken, settings.debug);
    } else if (buttonEl.style.stroke == colors.added) {
        // Already pushed button, collection has this entry so remove it

        // Override cookies if configured
        let currentValues;
        if (settings.ct0 && settings.authToken)
            currentValues = await overrideCookies(settings.ct0, settings.authToken, settings.debug);

        const request = new Request(`https://api.twitter.com/1.1/collections/entries/remove.json?tweet_id=${url.replace(/\/+$/, "").split("/").pop()}&id=custom-1604818441545736199`, {
            method: "POST",
            headers: {
                "authorization": settings.authorization,
                "X-Csrf-Token": settings.ct0 ? settings.ct0 : receive.XCsrfToken
            }
        });
        if (settings.debug)
            console.debug("Req:", request);

        const response = await fetch(request);
        if (settings.debug)
            console.debug("Res:", response);
        if (!response.ok) {
            response.json().then(data => {
                console.error(`${response.status} ${response.statusText} from ${request.url}\n${data.errors[0].message}`);
                buttonEl.style.stroke = colors.error;
                setTimeout(() => {
                    buttonEl.style = null;
                }, 2000);
            });
        }
        else {
            buttonEl.style = colors.added;
        }

        // Restore cookies if it needs
        if (currentValues)
            await overrideCookies(currentValues.ct0, currentValues.authToken, settings.debug);
    }
}

const mo = new MutationObserver((mutationList, observer) => {
    if (
        mutationList.findIndex(m => m.type === "childList" &&
            m.target.lastChild instanceof Element && (m.target.lastChild.getAttribute("data-testid") == "cellInnerDiv")) != -1) {
        insertIcon();
    }
});

const config = {
    childList: true,
    subtree: true,
    attributes: true
}

let nIntervId;
let rootElement = document.getElementById("layers");
if (rootElement != null) {
    mo.observe(document.getElementById("layers").parentElement, config);
} else {
    // idk sometime failed to get element
    if (!nIntervId) {
        nIntervId = setInterval(() => {
            console.warn("Failed to get HTML element, retrying...");
            rootElement = document.getElementById("layers");
            if (rootElement != null) {
                clearInterval(nIntervId);
                nIntervId = null;
                mo.observe(document.getElementById("layers").parentElement, config);
            }
        }, 1000);
    }
}