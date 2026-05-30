let triageTabId = null;
let tabs = [];
let idx = 0;
let currentTab = null;
let currentScreenshot = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const me = await chrome.tabs.getCurrent();
  triageTabId = me.id;

  const all = await chrome.tabs.query({ currentWindow: true });
  // Skip our own triage page and anything we can't screenshot (chrome://, etc).
  tabs = all.filter(t => t.id !== triageTabId && /^https?:/.test(t.url || ''));

  if (tabs.length === 0) {
    showDone('No tabs to triage.');
    return;
  }
  await present(0);
}

async function present(i) {
  if (i >= tabs.length) {
    showDone('All tabs triaged \u{1F389}');
    return;
  }
  idx = i;
  currentTab = tabs[i];

  // Activate the target tab so it's visible, capture it, then come back
  // to our triage page. A full page (unlike a popup) survives these switches.
  try {
    await chrome.tabs.update(currentTab.id, { active: true });
    await new Promise(r => setTimeout(r, 400));
    currentScreenshot = await chrome.tabs.captureVisibleTab(
      currentTab.windowId, { format: 'png' }
    );
  } catch (e) {
    currentScreenshot = null;
  }
  await chrome.tabs.update(triageTabId, { active: true });

  render();
}

function render() {
  document.getElementById('progress').textContent =
    `Tab ${idx + 1} of ${tabs.length}`;

  const img = document.getElementById('tab-preview');
  if (currentScreenshot) {
    img.src = currentScreenshot;
    img.style.display = 'block';
  } else {
    img.removeAttribute('src');
    img.style.display = 'none';
  }

  document.getElementById('tab-title').textContent = currentTab.title || '';
  document.getElementById('tab-url').textContent = currentTab.url || '';
  document.getElementById('board-select').style.display = 'none';
}

function showDone(msg) {
  document.getElementById('triage-container').innerHTML =
    `<p style="padding:24px;text-align:center;font-size:16px;">${msg}</p>
     <div id="nav"><button id="view-boards-btn">View Boards</button></div>`;
  document.getElementById('view-boards-btn').onclick = openBoards;
}

document.getElementById('keep-btn').onclick = () => present(idx + 1);

document.getElementById('close-btn').onclick = async () => {
  try { await chrome.tabs.remove(currentTab.id); } catch (e) {}
  await present(idx + 1);
};

document.getElementById('bookmark-btn').onclick = async () => {
  await populateBoards();
  document.getElementById('board-select').style.display = 'block';
};

document.getElementById('board-pick').onchange = (e) => {
  document.getElementById('new-board').style.display =
    e.target.value === '__new__' ? 'block' : 'none';
};

document.getElementById('save-btn').onclick = async () => {
  const pick = document.getElementById('board-pick');
  let name = pick.value;
  if (name === '__new__') {
    name = document.getElementById('new-board').value.trim();
  }
  if (!name) return;

  const { boards = {} } = await chrome.storage.local.get('boards');
  if (!boards[name]) boards[name] = [];

  const thumbnail = currentScreenshot
    ? await downscaleImage(currentScreenshot)
    : '';

  boards[name].push({
    title: currentTab.title,
    url: currentTab.url,
    thumbnail
  });

  await chrome.storage.local.set({ boards });
  document.getElementById('new-board').value = '';
  await present(idx + 1);
};

document.getElementById('view-boards-btn').onclick = openBoards;

function openBoards() {
  chrome.tabs.create({ url: 'boards.html' });
}

async function populateBoards() {
  const { boards = {} } = await chrome.storage.local.get('boards');
  const pick = document.getElementById('board-pick');
  pick.innerHTML = '';

  for (const name of Object.keys(boards)) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    pick.appendChild(opt);
  }
  const newOpt = document.createElement('option');
  newOpt.value = '__new__';
  newOpt.textContent = '➕ New board…';
  pick.appendChild(newOpt);

  // Default to the new-board input when there are no boards yet.
  pick.value = '__new__';
  document.getElementById('new-board').style.display = 'block';
}

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
