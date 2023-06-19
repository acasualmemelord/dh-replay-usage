const radioButtons = document.querySelectorAll('input[name="size"]');

function submit(fileList) {
  document.getElementById('list').innerHTML = "<h3>REPLAYS USED:</h3><br>";
  document.getElementById("table").innerHTML = "<th>Pokemon</th><th>Use</th><th>Usage %</th><th>Winrate %</th>";
  let teamPreview;
  for (const radioButton of radioButtons) {
    if (radioButton.checked) {
      teamPreview = radioButton.value;
      break;
    }
  }
  if(teamPreview == 0) calcNoPreview(fileList);
  else calcPreview(fileList);
}

function calcPreview (fileList){
  let p1, p2, total;
  let p1w;
  let players1 = [];
  let players2 = [];
  let poke = [];
  let usage = [];
  let id;
  let filename;

  const fr = new FileReader();
  function readFile(i) {
    //setup replays
    if(i >= fileList.length){
      setTable(poke, players1, players2);
      return;
    }

    let file = fileList[i];
    fr.onload = function(e) {
      let contents = e.target.result;
	  
	  //find id of battle
	  let j = contents.indexOf("t:|");
	  id = contents.substring(j + 3, + contents.indexOf("\n", j));
	  filename = e.value;
	  console.log("file " + filename + ": " + id);

      //find player1 and player2
      j = contents.indexOf("p1|");
      p1 = contents.substring(j + 3, contents.indexOf("|", j + 4));
      console.log(p1);
      j = contents.indexOf("p2|");
      p2 = contents.substring(j + 3, contents.indexOf("|", j + 4));
      console.log(p2);

      //determine who won
      j = contents.indexOf("win|");
      if(contents.substring(j + 4, contents.indexOf("\n", j)) === p1) p1w = true;
      else p1w = false;

      players1.push(p1 + ((p1w) ? " (W)" : " (L)"));
      players2.push(p2 + ((!p1w) ? " (W)" : " (L)"));

      //find player1 and player2 mons
      j = 0;
      while (contents.indexOf("poke|", j + 1) > -1) {
        j = contents.indexOf("poke|", j + 1); //poke
        j = contents.indexOf("|", j + 1); //p1
        let k = j;
        j = contents.indexOf("|", j + 1); //pokemon
        let temp = contents.substring(j + 1, contents.indexOf("|", j + 1));
        if (temp.includes(",")) temp = temp.substring(0, temp.length - 3);
        let temp2 = contents.substring(k + 1, k + 3);
        pushMon(poke, temp, temp2, p1w);
      }

      //change base into mega
      j = 0;
      while (contents.indexOf("detailschange|", j + 1) > -1) {
        j = contents.indexOf("detailschange|", j + 1); //detailschange
        j = contents.indexOf("|", j + 1); //p: base
        let k = contents.substring(j + 1, j + 3); //player
        j = contents.indexOf("|", j + 1); //mega
        let l = j;
        j = contents.indexOf("\n", j + 1); //newline
        if (contents.substring(l, j).indexOf(",") != -1) j -= 3;

        let mega = contents.substring(l + 1, j);
        let base = mega.substring(0, mega.lastIndexOf("-"));
        if (base.indexOf("Mega") != -1) base = base.substring(0, base.length - 5);
        let player = (k == 'p1') ? p1 : p2;

        //console.log(mega + " used by " + player);
        poke = removeOne(poke, base);
        pushMon(poke, mega, k, p1w);
      }
      readFile(i + 1);
    }
    fr.readAsText(file);
  }
  readFile(0);
}

function calcNoPreview (fileList){
  let p1, p2, total;
  let p1w;
  let players1 = [];
  let players2 = [];
  let poke = [];
  let usage = [];

  const fr = new FileReader();
  function readFile(i) {
    //setup replays
    if(i >= fileList.length){
      setTable(poke, players1, players2);
      return;
    }

    let file = fileList[i];
    fr.onload = function(e) {
      let contents = e.target.result;

      //find player1 and player2
      let j = contents.indexOf("p1");
      p1 = contents.substring(j + 3, contents.indexOf("|", j + 4));
      j = contents.indexOf("p2");
      p2 = contents.substring(j + 3, contents.indexOf("|", j + 4));

      //determine who won
      j = contents.indexOf("win");
      if(contents.substring(j + 4, contents.indexOf("\n", j)) === p1) p1w = true;
      else p1w = false;

      players1.push(p1 + ((p1w) ? " (W)" : " (L)"));
      players2.push(p2 + ((!p1w) ? " (W)" : " (L)"));

      //find player1 and player2 mons
      j = 0;
      let lines = [];
      while (contents.indexOf("switch|", j + 1) > -1) {
        j = contents.indexOf("switch|", j + 1); //switch
        let k = j;
        j = contents.indexOf("|", j + 1); //p1a
        let temp4 = contents.substring(j + 1, j + 3);
        j = contents.indexOf("|", j + 1); //pokemon

        let temp = contents.substring(j + 1, contents.indexOf("|", j + 1));
        if (temp.includes(",")) temp = temp.substring(0, temp.length - 3);
        let temp2 = contains(poke, temp, 0);
        let temp3;
        let temp5;

        j = contents.indexOf("|", j + 1); //hp
        let line = contents.substring(k, j);
        if(contains(lines, line, 0) == -1){
          lines.push([line]);

          //push pokemon, usage, and win amount
          //console.log(temp + ": " + p1 + " vs. " + p2 + ": " + temp4);
          if (temp4 == "p1"){
            //temp5 = p1;
            if (p1w) temp3 = 1;
            else temp3 = 0;
          } else {
            //temp5 = p2;
            if (!p1w) temp3 = 1;
            else temp3 = 0;
          }

          if (temp2 == -1) poke.push([temp, 1, temp3]);
          else {
            poke[temp2][1] ++;
            poke[temp2][2] += temp3;
          }
        }
      }
      readFile(i + 1);
    }
    fr.readAsText(file);
  }
  readFile(0);
}

function removeOne(arr, mon) {
  let i = contains(arr, mon, 0);
  //console.log(mon + " " + i + " " + arr[i]);
  if(arr[i][1] == 1) {
    arr.splice(i, 1);
  }
  else arr[i][1] --;
  return arr;
}

function arrTotal (arr) {
  let result = 0;
  for (let i = 0; i < arr.length; i ++){
    result += arr[i][1];
  }
  return result;
}

function setTable (poke, players1, players2, id) {
  for (let k = 0; k < players1.length; k ++){
    document.getElementById('list').innerHTML += players1[k] + " VS. " + players2[k] + "<br>";
  }

  //create usage table
  let pokeTotal = arrTotal(poke);
  poke.sort((a,b) => b[1] - a[1]);

  let tbl = document.createElement("table");
  let tblHead = document.createElement("thead");
  let mon = document.createElement('th');
  mon.innerHTML = "Pokemon";
  let use = document.createElement('th');
  use.innerHTML = "Use";
  let useP = document.createElement('th');
  useP.innerHTML = "Usage %";
  let win = document.createElement('th');
  win.innerHTML = "Winrate %";

  tblHead.appendChild(mon);
  tblHead.appendChild(use);
  tblHead.appendChild(useP);
  tblHead.appendChild(win);
  tbl.appendChild(tblHead);

  let tblBody = document.createElement("tbody");
  let table = document.getElementById("table");
  for (let l = 0; l < poke.length; l ++){
    let row = table.insertRow(-1);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);

    cell1.innerHTML = poke[l][0];
    cell2.innerHTML = poke[l][1];
    cell3.innerHTML = Math.round(poke[l][1] / (players1.length + players2.length) * 10000) / 100 + "%";
    cell4.innerHTML = Math.round(poke[l][2] / poke[l][1] * 10000) / 100 + "%";
  }

  table = tbl;
}

function contains (arr, val, index) {
  for (let i = 0; i < arr.length; i ++){
    if (arr[i][index] == val) return i;
  }
  return -1;
}

function pushMon (poke, mon, player, win) {
  let inArr = contains(poke, mon, 0);
  let winR;

  //push pokemon, usage, and win amount
  if (player == "p1"){
    if (win) winR = 1;
    else winR = 0;
  } else {
    if (!win) winR = 1;
    else winR = 0;
  }

  if (inArr == -1) poke.push([mon, 1, winR]);
  else {
    poke[inArr][1] ++;
    poke[inArr][2] += winR;
  }
}
