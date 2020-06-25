// Author: Jonathan Chavez - tabaresj@google.com
var isTerminalOpen = false;

window.addEventListener("keydown", keyboardHandler);


function keyboardHandler(e){
  e = e || window.event;
  console.log(String.fromCharCode(e.keyCode))
  if(String.fromCharCode(e.keyCode) === 'T'){
    if(!isTerminalOpen){
      openTerminal();
      isTerminalOpen = true;
    }
    else{
      closeTerminal();
      isTerminalOpen = false;
    }
  }
}

function openTerminal(){
  document.getElementById("terminal").style.visibility = "visible";
}

function closeTerminal(){
  document.getElementById("terminal").style.visibility = "hidden";
}