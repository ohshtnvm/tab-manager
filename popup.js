let currentTab = null;
let currentScreenshot = null;
let tabs = [];
let tabIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  tabs = await chrome.tabs.query({});
  if (tabs.length === 0) {
    document.getElementById('triage-container').innerHTML = '<p>No tabs open.</p>';
    return;
  }
  await showTab(0);
});

async function showTab(index) {
  if (index >= tabs.length) {
    document.getElementById('triage-container').innerHTML = '<p>All tabs triaged.</p>';
    return;
  }
  tabIndex = index;
  currentTab = tabs[index];

  await chrome.tabs.update(currentTab.id, { active: true });
  await new Promise(r => setTimeout(r, 500));

  currentScreenshot = await chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: 'png' });

  const img = document.getElementById('tab-preview');
  img.src = currentScreenshot;
  img.style.maxWidth = '300px';
  img.style.maxHeight = '200px';

  document.getElementById('tab-title').textContent = currentTab.title;
  document.getElementById('tab-url').textContent = currentTab.url;
  document.getElementById('board-select').style.display = 'none';
}

document.getElementById('keep-btn').onclick = async () => {
  await showTab(tabIndex + 1);
};

document.getElementById('close-btn').onclick = async () => {
  await chrome.tabs.remove(currentTab.id);
  await showTab(tabIndex + 1);
};

document.getElementById('bookmark-btn').onclick = () => {
  document.getElementById('board-select').style.display = 'block';
};

document.getElementById('save-btn').onclick = async () => {
  const boardName = document.getElementById('board-name').value.trim();
  if (!boardName) return;

  const data = await chrome.storage.local.get('boards') || { boards: {} };
  if (!data.boards) data.boards = {};
  if (!data.boards[boardName]) data.boards[boardName] = [];

  const thumbnail = await downscaleImage(currentScreenshot);

  data.boards[boardName].push({
    title: currentTab.title,
    url: currentTab.url,
    thumbnail: thumbnail
  });

  await chrome.storage.local.set(data);
  document.getElementById('board-name').value = '';
  await showTab(tabIndex + 1);
};

document.getElementById('view-boards-btn').onclick = () => {
  chrome.tabs.create({ url: 'boards.html' });
};

async function downscaleImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 200, 150);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}
