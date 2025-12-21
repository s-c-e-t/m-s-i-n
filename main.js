const PAGES = [
  {
    id: 'clue_01', 
    title: 'Clue 01: Secret Mission', 
    file: 'clues/clue_01.html'
  },
  {
    id: 'clue_02', 
    title: 'Clue 2: A Private Conversation', 
    file: 'clues/clue_02.html'
  },
  {
    id: 'clue_03', 
    title: 'Clue 3: U R OK!', 
    file: 'clues/clue_03.html'
  },
  {
    id: 'clue_04',
    title: 'Clue 4: Logic Puzzle',
    file: 'clues/clue_04.html'
  },
  {
    id: 'clue_05',
    title: 'Clue 5: Liquid Intelligence',
    file: 'clues/clue_05.html'
  },
  {
    id: 'clue_06',
    title: 'Clue 6: Spatial',
    file: 'clues/clue_06.html'
  },
  {
    id: 'clue_07',
    title: 'Clue 7: Awareness',
    file: 'clues/clue_07.html'
  },
  {
    id: 'clue_08',
    title: 'Clue 8: Quid Pro Quo',
    file: 'clues/clue_08.html'
  },
  {
    id: 'clue_09',
    title: 'Clue 9: Bio-Hazard Containment',
    file: 'clues/clue_09.html'
  },
  {
    id: 'clue_10',
    title: 'Clue 10: Mission Complete',
    file: 'clues/clue_10.html'
  }
];

const pagesDiv = document.getElementById('pages');

function renderPages() {
  pagesDiv.innerHTML = '';
  PAGES.forEach(p => {
    const btn = document.createElement('button');
    btn.textContent = p.title;
    
    btn.onclick = () => {
      window.location.href = p.file;
    };
    
    pagesDiv.appendChild(btn);
  });
}

renderPages();
