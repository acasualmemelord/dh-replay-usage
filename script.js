function submit(fileList) {
  document.getElementById('list').innerHTML = "<h3>REPLAYS USED:</h3><br>";
  document.getElementById("table").innerHTML = "<th>Pokemon</th><th>Use</th><th>Usage %</th><th>Winrate %</th>";
  let p1, p2, total;
  let p1w;
  let players1 = [];
  let players2 = [];
  let poke = [];
  let usage = [];

  const fr = new FileReader();
  function readFile(i){
    //setup replays
    if(i >= fileList.length){
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
        cell3.innerHTML = Math.round(poke[l][1] / pokeTotal * 10000) / 100 + "%";
        cell4.innerHTML = Math.round(poke[l][2] / poke[l][1] * 10000) / 100 + "%";
      }

      document.getElementById("table") = tbl;

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
      while (contents.indexOf("poke|", j + 1) > -1) {
        j = contents.indexOf("poke|", j + 1);

        let temp = contents.substring(j + 8, contents.indexOf(",", j + 1));
        let temp2 = contains(poke, temp, 0);
        let temp3;

        //push pokemon, usage, and win amount
        if (contents.substring(j + 5, j + 7) == "p1"){
          if (p1w) temp3 = 1;
          else temp3 = 0;
        } else {
          if (!p1w) temp3 = 1;
          else temp3 = 0;
        }

        if (temp2 == -1) poke.push([temp, 1, temp3]);
        else {
          poke[temp2][1] ++;
          poke[temp2][2] += temp3;
        }
      }

      readFile(i + 1);
    }
    fr.readAsText(file);
  }
  readFile(0);
}

function contains (arr, val, index) {
  for (let i = 0; i < arr.length; i ++){
    if (arr[i][index] == val) return i;
  }
  return -1;
}

function arrTotal (arr) {
  let result = 0;
  for (let i = 0; i < arr.length; i ++){
    result += arr[i][1];
  }
  return result;
}
