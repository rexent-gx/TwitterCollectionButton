browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const args = JSON.parse(request)
  console.debug(`Recv: ${args.command}`);
  switch (args.command) {
    case "getCookies":
      {
        browser.cookies.getAll({ url: sender.url, storeId: sender.tab.cookieStoreId })
          .then(cookies => {
            let authToken, XCsrfToken = "";
            cookies.forEach(cookie => {
              switch (cookie.name) {
                case "ct0":
                  XCsrfToken = cookie.value
                  break;

                case "auth_token":
                  authToken = cookie.value
                  break;
              }
            });

            sendResponse({ authToken: authToken, XCsrfToken: XCsrfToken });
          });
        break;
      }
    case "getCookie":
      {
        browser.cookies.get({ url: sender.url, storeId: sender.tab.cookieStoreId, name: args.name })
          .then(currentCookie => {
            currentCookie.url = sender.url;
            delete currentCookie.hostOnly;
            delete currentCookie.session;
            sendResponse(currentCookie);
          })
        break;
      }
    case "setCookie":
      {
        browser.cookies.set(args.cookie)
          .then(setCookie => {
            sendResponse(setCookie);
          })
        break;
      }
  }
  return true;
});