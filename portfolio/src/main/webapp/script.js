// Author: Jonathan Chavez - tabaresj@google.com
var isTerminalOpen = false;

window.addEventListener('keydown', keyboardHandler);

function keyboardHandler(e) {
  e = e || window.event;
  if (String.fromCharCode(e.keyCode) === 'T') {
    if (!isTerminalOpen) {
      openTerminal();
      isTerminalOpen = true;
      runTerminal();
    } else {
      closeTerminal();
      isTerminalOpen = false;
    }
  }
}

function runTerminal() {}

function printTerminal(message) {
  //Simulates someone wrote a line to the terminal
  var typeSpeed = 50;
  var firstMessage = new Typed('#t1', {
    strings: ['hola'],
    typeSpeed,
    startDelay: 1000,
  });
}

function scrollTerminalToBottom() {
  var terminal = document.getElementById('terminal');
  terminal.scrollTop = terminal.scrollHeight;
}

function openTerminal() {
  document.getElementById('terminal').style.display = 'initial';
}

function closeTerminal() {
  document.getElementById('terminal').style.display = 'none';
}
