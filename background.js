// Open the triage page in a full tab (popups close when the active tab
// switches, which breaks screenshotting other tabs). Reuse it if open.
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('triage.html');
  const [existing] = await chrome.tabs.query({ url });
  if (existing) {
    await chrome.tabs.update(existing.id, { active: true });
  } else {
    await chrome.tabs.create({ url });
  }
});
