document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get('boards');
  const boards = data.boards || {};

  const grid = document.getElementById('boards-grid');

  if (Object.keys(boards).length === 0) {
    grid.innerHTML = '<p>No boards yet.</p>';
    return;
  }

  for (const [boardName, cards] of Object.entries(boards)) {
    const boardSection = document.createElement('div');
    boardSection.className = 'board-section';
    boardSection.innerHTML = `<h2>${boardName}</h2>`;

    const cardsDiv = document.createElement('div');
    cardsDiv.className = 'cards-grid';

    for (const card of cards) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.innerHTML = `
        <img src="${card.thumbnail}" alt="${card.title}">
        <h3>${card.title}</h3>
        <a href="${card.url}" target="_blank">Open</a>
      `;
      cardsDiv.appendChild(cardEl);
    }

    boardSection.appendChild(cardsDiv);
    grid.appendChild(boardSection);
  }
});
