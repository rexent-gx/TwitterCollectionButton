function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    collectionId: document.querySelector("#colectionId").value,
    authorization: document.querySelector("#authorization").value,
    authToken: document.querySelector("#authToken").value,
    ct0: document.querySelector("#ct0").value,
    debug: document.querySelector("#debug").checked,
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#colectionId").value = result.collectionId || "";
    document.querySelector("#authorization").value = result.authorization ||
      "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
    document.querySelector("#authToken").value = result.authToken || "";
    document.querySelector("#ct0").value = result.ct0 || "";
    document.querySelector("#debug").checked = result.debug || false;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.sync.get(["collectionId", "authorization", "authToken", "ct0", "debug"]);
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
