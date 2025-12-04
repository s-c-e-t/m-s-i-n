// Pages and passwords
const PAGES = [
  {id: 'logic', title: 'Logic Puzzle — Operation: Carol', file: 'puzzles/logic.html', password: 'PUZZLE-1'},
  {id: 'confirm', title: 'Confirm Location', file: 'puzzles/confirm.html', password: 'CONFIRM-1'}
];


// Load unlocked pages from sessionStorage
let unlocked = JSON.parse(sessionStorage.getItem('unlocked')) || {};


const pagesDiv = document.getElementById('pages');


function renderPages() {
  pagesDiv.innerHTML = '';
  PAGES.forEach(p => {
    const btn = document.createElement('button');
    btn.textContent = p.title;
    
    // Button should always be clickable to open page, 
    // regardless of whether it’s unlocked
    btn.onclick = () => {
      if (unlocked[p.id]) {
        // Already unlocked → go to page
        window.location.href = p.file;
      } else {
        // Not unlocked → prompt for code
        const code = prompt(`Enter code to unlock: ${p.title}`);
        if (code && code.trim() === p.password) {
          unlocked[p.id] = true;
          sessionStorage.setItem('unlocked', JSON.stringify(unlocked));
          alert('Page unlocked!');
          window.location.href = p.file;
        } else {
          alert('Incorrect code. Check your envelope and try again.');
        }
      }
    };
    
    pagesDiv.appendChild(btn);
  });
}



function unlockPage(page) {
  const code = prompt(`Enter code to unlock: ${page.title}`);
  if(code && code.trim() === page.password) {
    unlocked[page.id] = true;
    sessionStorage.setItem('unlocked', JSON.stringify(unlocked));
    alert('Page unlocked!');
    window.location.href = page.file;
  } else {
    alert('Incorrect code. Check your envelope and try again.');
  }
}


renderPages();
