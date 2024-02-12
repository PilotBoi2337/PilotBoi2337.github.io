import { useState } from 'react'
import './App.css'
import QRModal from './QRModal';
import blueField from './assets/blueField.png';
import redField from './assets/redField.png';
import logo from './assets/aembot_icon_vector.svg';
import {QrReader} from 'react-qr-reader';

function App() {


  const [showQR, setShowQR] = useState(true);
  const [finalData, setQrData] = useState(''); // Initialize qrData as a state variable
  
  //for pageQR (the page with the qr scanner)
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setData] = useState('No result');
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleScan = (result, error) => {
    if (!!result) {
      setData(result?.text);
      const csvBlob = new Blob([result?.text], { type: 'text/csv' });
      const fileUrl = URL.createObjectURL(csvBlob);
      setDownloadUrl(fileUrl);
      document.getElementById('resetDownloadB').classList.remove('hidden');
    }
  };

  const handleStopScan = () => {
    //reset scanning
    setData("No result");
    document.getElementById('resetDownloadB').classList.add('hidden');
    setDownloadUrl(null);
  };

  const handleError = err => {
    console.error(err);
  }

  const handleStartScan = () => {
    setShowScanner(true);
  }

  function goHome() {
    document.getElementById('page1').classList.remove('hidden');
    document.getElementById('pageQR').classList.add('hidden');
    document.getElementById('page5').classList.add('hidden');
  }

  function restart() {
    document.getElementById('page1').classList.remove('hidden');
    document.getElementById('page5').classList.add('hidden');
    qrData = "";
    autoNoteData = "";
    teleOpNoteData = "";
    document.getElementById('startAuto').style.backgroundColor = "black";
    document.getElementById('getRobotButton').classList.remove('hidden');
    var prevMatchNum = document.getElementById('match').value;
    document.getElementById('match').value = ++prevMatchNum;
    document.getElementById("startMessage").innerHTML = "";
    document.getElementById('nextPage1Button').classList.add('hidden');
    autoArr = [];
    teleArr = [];
    //deselecting climb
    climbStartTime = 'no climb';
    document.getElementById('climbB').classList.remove('selected');
  }

  function goToScanner() {
    document.getElementById('pageQR').classList.remove('hidden');
    document.getElementById('page1').classList.add('hidden');
  }


  //placeholders
  const qrTitle = "Scan me!";
  var qrData = "";
  var qrData1 = "";
  var qrData2 = "";
  var startTime, startPos, autoNoteData;
  var mobility = "no";
  var qrData3 = "";
  var teleOpNoteData;
  var trapCount = 0;
  var climbStartTime;
  var qrData4 = "";

  //for calculations
  var autoArr = [];
  var teleArr = [];
  
  //used for timestamp tracking
  var startTime;
  var pickupTime;
  var heldNote;
  var timeToPickup;

  function saveAsCSV(array){
    var data;
    for(var index in array){
      data += array[index] + ",";
    };
    while(data.substring(0, 9) == "undefined"){
      data = data.substring(9);
    };
    if(data.substring(data.length - 4) == ", , ") {
      //removes the extraneous comma that appears if you provide an argument that already ends with a comma
      data = data.substring(0, data.length - 2);
    }
    return data;
  }

  async function assignRobot() {
    var eventKey = document.getElementById('eventKey').value;
    var schedule;
    if (localStorage.getItem("schedule")) {
      console.log("schedule found!");
      schedule = JSON.parse(localStorage.getItem("schedule"));
      if(schedule.length == 0 || schedule[0].event_key != eventKey){
        // get schedule from blueAlliance
        const myHeaders = new Headers();
        myHeaders.append("X-TBA-Auth-Key", "sFqG7OPSwFgG7Qudvkr4CTa21jcnCg5EA9EzFE3KGhGTunEuPWXaaMfp77NMJhFF");
        
        const requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };
        const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`, requestOptions);
        if (response.ok) {
          schedule = await response.json();
          console.log(schedule);
          localStorage.setItem("schedule", JSON.stringify(schedule));
        } else {
          // handle errors
          console.error('Failed to fetch schedule:', response.status, response.statusText);
          document.getElementById('startMessage').innerHTML = "Failed to retrieve match schedule!";
          return;
        }
      }
    } else {
      // get schedule from blueAlliance
      const myHeaders = new Headers();
      myHeaders.append("X-TBA-Auth-Key", "sFqG7OPSwFgG7Qudvkr4CTa21jcnCg5EA9EzFE3KGhGTunEuPWXaaMfp77NMJhFF");
      
      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
      const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`, requestOptions);
      if (response.ok) {
        schedule = await response.json();
        console.log(schedule);
        localStorage.setItem("schedule", JSON.stringify(schedule));
      } else {
        // handle errors
        console.error('Failed to fetch schedule:', response.status, response.statusText);
        document.getElementById('startMessage').innerHTML = "Failed to retrieve match schedule!";
        return;
      }
    }

    //assign robot
    var role = document.getElementById('role').value;
    var matchNum = document.getElementById('match').value;
    var correctMatch;
    for(var match of schedule){
      if ((match.match_number == matchNum) && match.comp_level == "qm"){
        correctMatch = match;
        break;
      }
    }
    console.log(correctMatch);
    var matchAlliances = correctMatch.alliances;
    var correctTeamNum;
    if(role[0] == "b") {
      correctTeamNum = matchAlliances.blue.team_keys[role[1] - 1];
    }
    else if(role[0] == "r") {
      correctTeamNum = matchAlliances.red.team_keys[role[1] - 1];
    }
    var teamNum = correctTeamNum.substring(3);
    console.log(teamNum);

    document.getElementById('getRobotButton').classList.add('hidden');
    document.getElementById("startMessage").innerHTML = "You're scouting: <span id=teamNum>" + teamNum + "</span>";
    document.getElementById('nextPage1Button').classList.remove('hidden');
    document.getElementById('reassignRobot').classList.remove('hidden');
  }
  
  function nextPage1() {
    //save data
    const eventKey = document.getElementById('eventKey').value;
    const role = document.getElementById('role').value;
    const matchNum = document.getElementById('match').value;
    const scouterInitials = document.getElementById('initials').value;
    const teamNum = document.getElementById('teamNum').innerText;
    //console.log(eventKey);
    qrData1 = saveAsCSV([eventKey, role, scouterInitials, matchNum, teamNum]);
    //console.log(qrData1);
    if(qrData1.substring(0, 9) == "undefined"){
      qrData1 = qrData1.substring(9);
    }

    //assuming preload by default
    logNote("preload");
    timeToPickup = 0;

    qrData = qrData1 + qrData2 + qrData3 + qrData4;
    console.log(qrData);
    //unhide next page
    document.getElementById('page2').classList.remove('hidden');
    document.getElementById('page1').classList.add('hidden');
    if(role[0] == "b") {
      document.getElementById('redField').style.display = 'none';
      document.getElementById('blueField').style.display = 'block';
      document.getElementById('b1').classList.remove('redArr');
      document.getElementById('b2').classList.remove('redArr');
      document.getElementById('b1').classList.add('blueArr');
      document.getElementById('b2').classList.add('blueArr');

      document.getElementById('start1').classList.remove('redArr');
      document.getElementById('start2').classList.remove('redArr');
      document.getElementById('start3').classList.remove('redArr');
      document.getElementById('start4').classList.remove('redArr');
      document.getElementById('start1').classList.add('blueArr');
      document.getElementById('start2').classList.add('blueArr');
      document.getElementById('start3').classList.add('blueArr');
      document.getElementById('start4').classList.add('blueArr');
    }
    else {
      document.getElementById('blueField').style.display = 'none';
      document.getElementById('redField').style.display = 'block';
      document.getElementById('b1').classList.remove('blueArr');
      document.getElementById('b2').classList.remove('blueArr');
      document.getElementById('b1').classList.add('redArr');
      document.getElementById('b2').classList.add('redArr');

      document.getElementById('start1').classList.remove('blueArr');
      document.getElementById('start2').classList.remove('blueArr');
      document.getElementById('start3').classList.remove('blueArr');
      document.getElementById('start4').classList.remove('blueArr');
      document.getElementById('start1').classList.add('redArr');
      document.getElementById('start2').classList.add('redArr');
      document.getElementById('start3').classList.add('redArr');
      document.getElementById('start4').classList.add('redArr');
    }

    //unhiding the notes
    document.getElementById('b1').classList.remove('hidden');
    document.getElementById('b2').classList.remove('hidden');
    document.getElementById('b3').classList.remove('hidden');
    document.getElementById('t1').classList.remove('hidden');
    document.getElementById('t2').classList.remove('hidden');
    document.getElementById('t3').classList.remove('hidden');
    document.getElementById('t4').classList.remove('hidden');
    document.getElementById('t5').classList.remove('hidden');

    //unselecting the notes
    document.getElementById('b1').classList.remove('noteSelected');
    document.getElementById('b2').classList.remove('noteSelected');
    document.getElementById('b3').classList.remove('noteSelected');
    document.getElementById('t1').classList.remove('noteSelected');
    document.getElementById('t2').classList.remove('noteSelected');
    document.getElementById('t3').classList.remove('noteSelected');
    document.getElementById('t4').classList.remove('noteSelected');
    document.getElementById('t5').classList.remove('noteSelected');

    //unselecting the starting position
    document.getElementById('start1').classList.remove('startPosSelected');
    document.getElementById('start2').classList.remove('startPosSelected');
    document.getElementById('start3').classList.remove('startPosSelected');
    document.getElementById('start4').classList.remove('startPosSelected');
  }

  function lastPage1() {
    //save page 2 data

    //unhide last page
    document.getElementById('page1').classList.remove('hidden');
    document.getElementById('page2').classList.add('hidden');
  }

  function startAuto() {
    startTime = new Date();
    document.getElementById('startAuto').style.backgroundColor = "green";
  }

  function logStart(startingPos) {

    //clears previous selection indicator 
    document.getElementById('start1').classList.remove('startPosSelected');
    document.getElementById('start2').classList.remove('startPosSelected');
    document.getElementById('start3').classList.remove('startPosSelected');
    document.getElementById('start4').classList.remove('startPosSelected');

    //log starting position
    startPos = startingPos;
    document.getElementById(startPos).classList.add('startPosSelected');
  }

  function mobilityToggle(){
    
    if(!document.getElementById('mobilityButton').classList.contains('selected')){
      document.getElementById('mobilityButton').classList.add('selected');
      mobility = "yes";
    }
    else {
      mobility = "no";
      document.getElementById('mobilityButton').classList.remove('selected');
    }
  }

  function logNote(note) {
    //a note is picked up

    //clears previous selection indicator
    document.getElementById('b1').classList.remove('noteSelected');
    document.getElementById('b2').classList.remove('noteSelected');
    document.getElementById('b3').classList.remove('noteSelected');
    document.getElementById('t1').classList.remove('noteSelected');
    document.getElementById('t2').classList.remove('noteSelected');
    document.getElementById('t3').classList.remove('noteSelected');
    document.getElementById('t4').classList.remove('noteSelected');
    document.getElementById('t5').classList.remove('noteSelected');

    pickupTime = new Date();
    if(note && note != "preload"){
      //auto
      document.getElementById('mobilityButton').classList.add('selected');
      mobility = "yes";
      heldNote = note;
      document.getElementById(heldNote).classList.add('noteSelected');
    }
    else if (note == "preload"){
      heldNote = note;
    }
    timeToPickup = (pickupTime - startTime) / 1000;

    document.getElementById('pickUpB').classList.add('disabled');
    document.getElementById('speakerB').classList.remove('disabled');
    document.getElementById('ampB').classList.remove('disabled');
    document.getElementById('droppedB').classList.remove('disabled');
    document.getElementById('trapB').classList.remove('disabled');

    document.getElementById("speakerB").classList.remove('lastSelected');
    document.getElementById("ampB").classList.remove('lastSelected');
    document.getElementById("droppedB").classList.remove('lastSelected');
    document.getElementById("trapB").classList.remove('lastSelected');
  }

  function scoredNote(place) {
    if(heldNote == "preload" && !document.getElementById('page3').classList.contains('hidden')) {
      //if preload is brought to teleOp
      const scoringLocation = place;
      const endTime = new Date();
      const timeToScore = (endTime - startTime) / 1000;
      console.log("preloaded piece scored in teleOp");
      teleOpNoteData += saveAsCSV([scoringLocation, timeToPickup, timeToScore]);
      teleArr.push([scoringLocation, timeToPickup + timeToScore]);
      if(teleOpNoteData.substring(0, 9) == "undefined"){
        teleOpNoteData = teleOpNoteData.substring(9);
      };

      //reseting values for next cycle
      heldNote = null;
      pickupTime = null;

      document.getElementById('pickUpB').classList.remove('disabled');
      document.getElementById('speakerB').classList.add('disabled');
      document.getElementById('ampB').classList.add('disabled');
      document.getElementById('droppedB').classList.add('disabled');
      document.getElementById('trapB').classList.add('disabled');
    }
    if(document.getElementById('pickUpB').classList.contains('disabled')) {
      //piece picked up is scored
      const scoringLocation = place;
      const endTime = new Date();
      const timeToScore = (endTime - pickupTime) / 1000;
      console.log("heldNote: " + heldNote);
      console.log(!document.getElementById('page3').classList.contains('hidden'));
      if(heldNote && !document.getElementById('page2').classList.contains('hidden')){
        //auto
        autoNoteData += saveAsCSV([heldNote, scoringLocation, timeToPickup, timeToScore]);
        autoArr.push([scoringLocation, timeToPickup + timeToScore]);
        if(autoNoteData.substring(0, 9) == "undefined"){
          autoNoteData = autoNoteData.substring(9);
        };
        console.log(autoNoteData);
        if(heldNote != "preload"){document.getElementById(heldNote).classList.add('hidden');}
        
      }
      else if(heldNote == "preload" && !document.getElementById('page3').classList.contains('hidden')) {
        console.log("preloaded piece scored in teleOp");
        teleOpNoteData += saveAsCSV([scoringLocation, timeToPickup, timeToScore]);
        teleArr.push([scoringLocation, timeToPickup + timeToScore]);
        if(teleOpNoteData.substring(0, 9) == "undefined"){
          teleOpNoteData = teleOpNoteData.substring(9);
        };
      }
      else {
        document.getElementById("speakerB").classList.remove('lastSelected');
        document.getElementById("ampB").classList.remove('lastSelected');
        document.getElementById("droppedB").classList.remove('lastSelected');
        document.getElementById("trapB").classList.remove('lastSelected');
        //teleOp
        teleOpNoteData += saveAsCSV([scoringLocation, timeToPickup, timeToScore]);
        teleArr.push([scoringLocation, timeToPickup + timeToScore]);
        if(teleOpNoteData.substring(0, 9) == "undefined"){
          teleOpNoteData = teleOpNoteData.substring(9);
        };
        document.getElementById(place + "B").classList.add('lastSelected');
      }
      
      //reseting values for next cycle
      heldNote = null;
      pickupTime = null;

      document.getElementById('pickUpB').classList.remove('disabled');
      document.getElementById('speakerB').classList.add('disabled');
      document.getElementById('ampB').classList.add('disabled');
      document.getElementById('droppedB').classList.add('disabled');
      document.getElementById('trapB').classList.add('disabled');
    }
  }

  function climb() {
    if(!document.getElementById('climbB').classList.contains('selected')) {
      document.getElementById('climbB').classList.add('selected');
      var climbStart = new Date();
      climbStartTime = (climbStart - startTime)/1000;
    } else {
      //deselecting climb
      climbStartTime = 'no climb';
      document.getElementById('climbB').classList.remove('selected');
    }
    

  }

  function nextPage2() {
    qrData2 = saveAsCSV([startPos, mobility]);
    console.log(qrData2);
    qrData = qrData1 + qrData2 + qrData3 + qrData4;
    console.log(qrData);
    document.getElementById('page3').classList.remove('hidden');
    document.getElementById('page2').classList.add('hidden');

    //if a note is brought to teleOp:
    if(heldNote && heldNote !="preload"){
      heldNote == null;
      document.getElementById('pickUpB').classList.add('disabled');
      document.getElementById('speakerB').classList.remove('disabled');
      document.getElementById('ampB').classList.remove('disabled');
      document.getElementById('droppedB').classList.remove('disabled');
      document.getElementById('trapB').classList.remove('disabled');
    }
    else if (heldNote == "preload"){
      document.getElementById('pickUpB').classList.remove('disabled');
      document.getElementById('speakerB').classList.remove('disabled');
      document.getElementById('ampB').classList.remove('disabled');
      document.getElementById('droppedB').classList.remove('disabled');
      document.getElementById('trapB').classList.remove('disabled');
    }
  }

  function lastPage2() {
    const eventKey = document.getElementById('eventKey').value;
    const role = document.getElementById('role').value;
    const matchNum = document.getElementById('match').value;
    const scouterInitials = document.getElementById('initials').value;
    const teamNum = document.getElementById('teamNum').innerText;
    //console.log(eventKey);
    qrData1 = saveAsCSV([eventKey, role, scouterInitials, matchNum, teamNum]);
    //console.log(qrData1);
    if(qrData1.substring(0, 9) == "undefined"){
      qrData1 = qrData1.substring(9);
    }
    console.log(qrData);
    qrData = qrData1 + qrData2 + qrData3 + qrData4;

    //unhide previous page
    document.getElementById('page2').classList.remove('hidden');
    document.getElementById('page1').classList.add('hidden');
    if(role[0] == "b") {
      document.getElementById('redField').style.display = 'none';
      document.getElementById('blueField').style.display = 'block';
      document.getElementById('b1').classList.remove('redArr');
      document.getElementById('b2').classList.remove('redArr');
      document.getElementById('b1').classList.add('blueArr');
      document.getElementById('b2').classList.add('blueArr');

      document.getElementById('start1').classList.remove('redArr');
      document.getElementById('start2').classList.remove('redArr');
      document.getElementById('start3').classList.remove('redArr');
      document.getElementById('start4').classList.remove('redArr');
      document.getElementById('start1').classList.add('blueArr');
      document.getElementById('start2').classList.add('blueArr');
      document.getElementById('start3').classList.add('blueArr');
      document.getElementById('start4').classList.add('blueArr');
    }
    else {
      document.getElementById('blueField').style.display = 'none';
      document.getElementById('redField').style.display = 'block';
      document.getElementById('b1').classList.remove('blueArr');
      document.getElementById('b2').classList.remove('blueArr');
      document.getElementById('b1').classList.add('redArr');
      document.getElementById('b2').classList.add('redArr');

      document.getElementById('start1').classList.remove('blueArr');
      document.getElementById('start2').classList.remove('blueArr');
      document.getElementById('start3').classList.remove('blueArr');
      document.getElementById('start4').classList.remove('blueArr');
      document.getElementById('start1').classList.add('redArr');
      document.getElementById('start2').classList.add('redArr');
      document.getElementById('start3').classList.add('redArr');
      document.getElementById('start4').classList.add('redArr');
    }

    document.getElementById('page2').classList.remove('hidden');
    document.getElementById('page3').classList.add('hidden');
  }

  function nextPage3() {
    if(climbStartTime == undefined){climbStartTime = "noClimb";}
    qrData3 = saveAsCSV(["endgame", climbStartTime]);
    console.log(qrData3);
    qrData = qrData1 + qrData2 + qrData3 + qrData4;
    console.log(qrData);
    document.getElementById('page4').classList.remove('hidden');
    document.getElementById('page3').classList.add('hidden');
  }

  function lastPage3() {
    document.getElementById('page3').classList.remove('hidden');
    document.getElementById('page4').classList.add('hidden');
  }

  function lastPage4() {
    document.getElementById('page4').classList.remove('hidden');
    document.getElementById('page5').classList.add('hidden');
  }

  function nextPage4() {

    var pickupMethod = document.getElementById('pickUpMethods').value;
    var climbStatus = document.getElementById('climbStatus').value;
    var otherInfo = document.getElementById('otherInfo').value;
    //compile fails list
    var fails = document.querySelector('fieldSet');
    var failsSelected = Array.from(fails.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
    var failsList = "";
    for(var i in failsSelected) {
      failsList += failsSelected[i] + ", ";
    };
    if(failsList == "undefined"){
      failsList == "no fails";
    };

    //final calculations: notes scored in teleOp, notes scored in auto, total notes scored, average cycle time
    console.log(autoArr);
    console.log(teleArr);
    var scoredInAuto = 0;
    var scoredInTeleOp = 0;
    var totalScored = 0;
    var totalCycleTime = 0;
    var avgCycleTime = 0;
    var canScoreIn = [];
    for (var i in autoArr) {
      if(autoArr[i][0] != "dropped"){
        if(!canScoreIn.includes(autoArr[i][0])){
          canScoreIn.push(autoArr[i][0]);
        }
        scoredInAuto++;
        totalCycleTime += autoArr[i][1];
      };
    };
    for (var i in teleArr) {
      if(teleArr[i][0] != "dropped"){
        if(!canScoreIn.includes(teleArr[i][0])){
          canScoreIn.push(teleArr[i][0]);
        }
        scoredInTeleOp++;
        totalCycleTime += teleArr[i][1];
      };
    };
    var canScoreInSpeaker = canScoreIn.includes('speaker');
    var canScoreInAmp = canScoreIn.includes('amp');
    var canScoreInTrap = canScoreIn.includes('trap');
    totalScored = scoredInAuto + scoredInTeleOp;
    avgCycleTime = totalCycleTime / totalScored;

    qrData4 = saveAsCSV([pickupMethod, climbStatus]) + saveAsCSV(["\"" + failsList + "\""]) + saveAsCSV(["\"" + otherInfo + "\""])
    qrData = qrData1 + qrData2 + qrData3 + qrData4;
    qrData += saveAsCSV([scoredInAuto, scoredInTeleOp, totalScored, avgCycleTime, canScoreInSpeaker, canScoreInAmp, canScoreInTrap]);
    console.log(qrData);

    //comment out the line below to hide variable data.
    qrData += saveAsCSV(["auto"]) + saveAsCSV([autoNoteData]) + saveAsCSV(["teleOp"]) + saveAsCSV([teleOpNoteData]);
    
    document.getElementById('page5').classList.remove('hidden');
    document.getElementById('page4').classList.add('hidden');

    //actually encodes the data into the QRCode
    //if link based download fails, replace fileUrl with qrData
    setQrData(qrData);
    console.log(qrData);

  }

  return (
    <div className="app">
      <div class="page page1" id="page1">
        {/* event, role, name, match, robot */}
        <button class="goToScannerB" onClick={() => goToScanner()}><i class="fa-solid fa-qrcode"></i></button>
        <h1 style={{marginTop: '80px'}}>AEMScout</h1>
        <img class="logo" src={logo}></img>
        <form>
          <div class="question">
            <label for="event">EVENT</label>
            <select name="event" id="eventKey" required>
                {/* get event_key from URL */}
                <option value="2023pncmp">2023 DCMP</option>
                <option value="2024orore">Clackamas</option>
                <option value="2024wayak">SunDome</option>
                <option value="2024orwil">Wilsonville</option>
                <option value="DCMP">DCMP</option>
                <option value="Worlds">Worlds</option>
            </select>
          </div>
          <div class="question">
            <label for="role">ROLE </label>
              <select name="role" id="role" required>
                <option value="b1">Blue 1</option>
                <option value="b2">Blue 2</option>
                <option value="b3">Blue 3</option>
                <option value="r1">Red 1</option>
                <option value="r2">Red 2</option>
                <option value="r3">Red 3</option>
              </select>
          </div>
          <div class="question">
            <label for="initials">SCOUTER INITIALS </label>
            <input type="text" id="initials" required></input>
          </div>
          <div class="question">
            <label for="match">MATCH</label>
            <input type="number" id="match" required></input>
          </div>
        </form>
        <button class="bButton" id="getRobotButton" onClick={() => assignRobot()}>GET ROBOT</button>
        <h3 id="startMessage"></h3>
        <button class="bButton hidden" id="nextPage1Button" onClick={() => nextPage1()}>NEXT PAGE</button>
        <button class="hidden" style={{margin: '10px', background: 'none'}} id="reassignRobot" onClick={() => assignRobot()}><i class="fa-solid fa-arrows-rotate fa-xl"></i></button>
      </div>

      <div class="page hidden pageQR" id="pageQR">
        <div class="topButtons">
        <button style={{height: '100%', paddingLeft: '30px', paddingRight: '30px'}} onClick={() => goHome()}><i class="fa-solid fa-house"></i></button>
        </div>
        <h2 style={{margin: '10px'}}>Scan a QR code:</h2>
        <p class="scanDirections"><b>Directions:</b> 
          <br/> 1. Get a QR code from a scouter.
          <br/> 2. Hit the start scanning button
          <br/> 3. Hold the code up to the webcam.
          <br/> 4. Press the download button once it appears.
          <br/> 5. Press reset to scan another QR code.
        </p>
        <button onClick={handleStartScan}>Start Scanning</button>
        {showScanner && (
            <QrReader
              scanDelay={10}
              onError={handleError}
              onResult={handleScan}
              style={{ width: '100%', height: '100%'}}
          />)}
          <p>{scannedData}</p>
          {downloadUrl && <a href={downloadUrl}>Download CSV</a>}
          <button id="resetDownloadB" class="hidden" style={{margin: '10px', borderRadius: '30px', backgroundColor: 'rgb(226, 111, 111)'}} onClick={handleStopScan}>Reset</button>
      </div>

      <div class="page hidden page2" id="page2">
        {/* auto (map) mobilityInAuto automatically checks if game piece is pressed*/}
        <div class="topButtons">
          <button class="back" onClick={() => lastPage1()}><i class="fa-solid fa-arrow-left"></i></button>
          <button id="startAuto" onClick={() => startAuto()}>start auto</button>
          <button class="forward" onClick={() => nextPage2()}><i class="fa-solid fa-arrow-right"></i></button>
        </div>
        <div class="imgContainer">
          <img class="fieldIMG" id="blueField" src={blueField} alt="Field image" />
          <img class="fieldIMG" id="redField" src={redField} alt="Field image" />
          <button class="startPos blueArr" id="start1" onClick={() => logStart("start1")}>1</button>
          <button class="startPos blueArr" id="start2" onClick={() => logStart("start2")}>2</button>
          <button class="startPos blueArr" id="start3" onClick={() => logStart("start3")}>3</button>
          <button class="startPos blueArr" id="start4" onClick={() => logStart("start4")}>4</button>
          <button class="note blueArr" id="b1" onClick={() => logNote("b1")}></button>
          <button class="note blueArr" id="b2" onClick={() => logNote("b2")}></button>
          <button class="note" id="b3" onClick={() => logNote("b3")}></button>
          <button class="note" id="t1" onClick={() => logNote("t1")}></button>
          <button class="note" id="t2" onClick={() => logNote("t2")}></button>
          <button class="note" id="t3" onClick={() => logNote("t3")}></button>
          <button class="note" id="t4" onClick={() => logNote("t4")}></button>
          <button class="note" id="t5" onClick={() => logNote("t5")}></button>
        </div>
        <button class="scored" id="speakerButton" onClick={() => scoredNote("speaker")}>Scored in Speaker</button>
        <button class="scored" id="ampButton" onClick={() => scoredNote("amp")}>Scored in Amp</button>
        <button class="scored" id="droppedButton" onClick={() => scoredNote("dropped")}>Dropped</button>
        <button class="scored" id="mobilityButton" onClick={() => mobilityToggle()}>Mobility</button>
      </div>

      <div class="page hidden page3" id="page3">
        {/* teleop (speaker, amp, pickup, drop, trap, climb) */}
        <div class="topButtons">
          <button class="back" onClick={() => lastPage2()}><i class="fa-solid fa-arrow-left"></i></button>
          <h3>TeleOp</h3>
          <button class="forward" onClick={() => nextPage3()}><i class="fa-solid fa-arrow-right"></i></button>
        </div>
        
        <button class="scored" id="pickUpB" onClick={() => logNote()}>Pickup</button>
        <button class="scored disabled" id="speakerB" onClick={() => scoredNote("speaker")}>Scored in speaker</button>
        <button class="scored disabled" id="ampB" onClick={() => scoredNote("amp")}>Scored in Amp</button>
        <button class="scored disabled" id="droppedB" onClick={() => scoredNote("dropped")}>Dropped</button>
        <button class="scored disabled" id="trapB" onClick={() => scoredNote("trap")}>Trap</button>

        <button class="scored" id="climbB" onClick={() => climb()}>Climb</button>
        
      </div>

      <div class="page hidden page4" id="page4">
        {/* fouls, fail(climb), CFL (common fail list), Other, Pickup? */}
        <div class="topButtons">
          <button class="back" onClick={() => lastPage3()}><i class="fa-solid fa-arrow-left"></i></button>
          <h3>Post Match</h3>
          <button class="forward" onClick={() => nextPage4()}><i class="fa-solid fa-arrow-right"></i></button>
        </div>

        <form>
          <div class="question">
            <label for="pickUpMethods">PICKUP METHOD</label>
            <select name="pickUpMethods" id="pickUpMethods" required>
                <option value="none" selected>None</option>
                <option value="ground only">Ground Only</option>
                <option value="source only">Source Only</option>
                <option value="ground and source">Ground and Source</option>
            </select>
          </div>
          <p></p>
          <div class="question">
            <label for="climbStatus">CLIMB </label>
            <select name="climbStatus" id="climbStatus" required>
                <option value="no attempt">No Attempt</option>
                <option value="climb success">Success</option>
                <option value="climb failed">Failed</option>
            </select>
          </div>

          <p></p>

          <div class="CFL">
          <label class="topLabel">COMMON FAILS LIST</label>
          <fieldset>
            <div class="fail">
              <label for="fail1">Stopped (and Restarted)</label>
              <input type="checkbox" id="fail1" name="fail1" value="stopped (and restarted)"></input>
            </div>
            <div class="fail">
              <label for="fail2">Died</label>
              <input type="checkbox" id="fail2" name="fail2" value="died"></input>
            </div>
            <div class="fail">
              <label for="fail1">Tipped</label>
              <input type="checkbox" id="fail3" name="fail3" value="tipped"></input>
            </div>
            <div class="fail">
              <label for="fail4">Red Card</label>
              <input type="checkbox" id="fail4" name="fail4" value="red card"></input>
            </div>
            <div class="fail">
              <label for="fail5">Yellow Card</label>
              <input type="checkbox" id="fail5" name="fail5" value="yellow card"></input>
            </div>
            <div class="fail">
              <label for="fail6">Broke</label>
              <input type="checkbox" id="fail6" name="fail6" value="broke"></input>
            </div>
            <div class="fail">
              <label for="fail7">Auto Failure</label>
              <input type="checkbox" id="fail7" name="fail7" value="auto failure"></input>
            </div>
            <div class="fail">
              <label for="fail8">Got Stuck</label>
              <input type="checkbox" id="fail8" name="fail8" value="got stuck"></input>
            </div>
            <div class="fail">
              <label for="fail9">Didn't Field Robot</label>
              <input type="checkbox" id="fail9" name="fail9" value="didn't field robot"></input>
            </div>
          </fieldset>
        </div>

          <div class="question">
          <label>OTHER INFO </label>
          <div><textarea id="otherInfo"></textarea></div>
          </div>

        </form>
      </div>

      <div class="page hidden page5" id="page5">
        <div class="topButtons">
            <button class="back" onClick={() => lastPage4()}><i class="fa-solid fa-arrow-left"></i></button>
        </div>
        <QRModal
          show={showQR}
          title={qrTitle}
          data={finalData}
        />
        <button class="restart" style={{position: 'absolute', top: '70%'}} onClick={() => restart()}>Restart &nbsp;<i class="fa-solid fa-arrows-rotate"></i></button>
      </div>
    </div>
  );
}

export default App;

