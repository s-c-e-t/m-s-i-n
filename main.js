const PAGES = [
  {
    id: 'clue_01', 
    title: 'Clue 1: Seriously Do This', 
    file: 'puzzles/clue_01.html'
  },
  {
    id: 'clue_02', 
    title: 'Clue 2: A Private Conversation', 
    file: 'puzzles/clue_02.html'
  },
  {
    id: 'clue_03', 
    title: 'Clue 3: Logic Puzzle', 
    file: 'puzzles/clue_03.html'
  },
  {
    id: 'clue_04',
    title: 'Clue 4: C.U.P.',
    file: 'puzzles/clue_04.html'
  },
  {
    id: 'clue_05',
    title: 'Clue 5: Tall or Small',
    file: 'puzzles/clue_05.html'
  },
  {
    id: 'clue_06',
    title: 'Clue 6: Getting Thirsty?',
    file: 'puzzles/clue_06.html'
  },
  {
    id: 'clue_07',
    title: 'Clue 7: Hmmm?',
    file: 'puzzles/clue_07.html'
  },
  {
    id: 'clue_08',
    title: 'Clue 8: Candid Cousin',
    file: 'puzzles/clue_08.html'
  },
  {
    id: 'clue_09',
    title: 'Clue 9: Pee-ew',
    file: 'puzzles/clue_09.html'
  },
  {
    id: 'clue_10',
    title: 'Clue 10: The End',
    file: 'puzzles/clue_10.html'
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
