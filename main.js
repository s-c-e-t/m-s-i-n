// Pages and passwords
const PAGES = [
{id: 'logic', title: 'Logic Puzzle — Operation: Carol', file: 'puzzles/logic.html', password: 'PUZZLE-1'},
{id: 'confirm', title: 'Confirm Location', file: 'puzzles/confirm.html', password: 'CONFIRM-1'}
];


// Load unlocked pages from localStorage
let unlocked = JSON.parse(localStorage.getItem('unlocked')) || {};


const pagesDiv = document.getElementById('pages');


function renderPages() {
pagesDiv.innerHTML = '';
PAGES.forEach(p => {
const btn = document.createElement('button');
btn.textContent = p.title;
btn.disabled = unlocked[p.id];
btn.onclick = () => unlockPage(p);
pagesDiv.appendChild(btn);
});
}


function unlockPage(page) {
const code = prompt(`Enter code to unlock: ${page.title}`);
if(code && code.trim() === page.password) {
unlocked[page.id] = true;
localStorage.setItem('unlocked', JSON.stringify(unlocked));
alert('Page unlocked!');
window.location.href = page.file;
} else {
alert('Incorrect code. Check your envelope and try again.');
}
}


renderPages();
