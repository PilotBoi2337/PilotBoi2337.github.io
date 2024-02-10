import { useState } from 'react'
import './App.css'
import QRModal from './QRModal';
import blueField from './assets/blueField.png';
import redField from './assets/redField.png';
import logo from './assets/aembot_icon_vector.svg';

function App() {


  const [showQR, setShowQR] = useState(false);
  const [finalData, setQrData] = useState(''); // Initialize qrData as a state variable
  
  //placeholders
  const qrTitle = "Here it is!";
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
  

  //used for timestamp tracking
  var startTime;
  var pickupTime;
  var heldNote;
  var timeToPickup;

  function saveAsCSV(array){
    var data;
    for(var index in array){
      data += array[index] + ", ";
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
    qrData2 = startTime + startPos + autoNoteData;
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
    if(note){
      //auto
      document.getElementById('mobilityButton').classList.add('selected');
      mobility = "yes";
      heldNote = note;
      document.getElementById(heldNote).classList.add('noteSelected');
    }
    timeToPickup = (pickupTime - startTime) / 1000;

    document.getElementById('pickUpB').classList.add('disabled');
    document.getElementById('speakerB').classList.remove('disabled');
    document.getElementById('ampB').classList.remove('disabled');
    document.getElementById('droppedB').classList.remove('disabled');
    document.getElementById('trapB').classList.remove('disabled');
  }

  function droppedNote() {
    if(document.getElementById('pickUpB').classList.contains('disabled')){
      const scoringLocation = "dropped";
      const endTime = new Date();
      const timeToScore = (endTime - pickupTime) / 1000;
      
      if(heldNote) {
        //auto
        autoNoteData += saveAsCSV([heldNote, scoringLocation, timeToPickup, timeToScore]);
        if(autoNoteData.substring(0, 9) == "undefined"){
          autoNoteData = autoNoteData.substring(9);
        };
        document.getElementById(heldNote).classList.add('hidden');
      } else {
        //teleOp
        teleOpNoteData += saveAsCSV([scoringLocation, timeToPickup, timeToScore]);
        if(teleOpNoteData.substring(0, 9) == "undefined"){
          teleOpNoteData = teleOpNoteData.substring(9);
        };
      }
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

  function scoredNote(place) {
    if(document.getElementById('pickUpB').classList.contains('disabled')){
      const scoringLocation = place;
      const endTime = new Date();
      const timeToScore = (endTime - pickupTime) / 1000;
      if(heldNote){
        //auto
        autoNoteData += saveAsCSV([heldNote, scoringLocation, timeToPickup, timeToScore]);
        if(autoNoteData.substring(0, 9) == "undefined"){
          autoNoteData = autoNoteData.substring(9);
        };
        console.log(autoNoteData);
        document.getElementById(heldNote).classList.add('hidden');
      } else {
        //teleOp
        teleOpNoteData += saveAsCSV([scoringLocation, timeToPickup, timeToScore]);
        if(teleOpNoteData.substring(0, 9) == "undefined"){
          teleOpNoteData = teleOpNoteData.substring(9);
        };
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

  function scoredTrap() {
    if(document.getElementById('pickUpB').classList.contains('disabled')){
      const scoringLocation = "trap";
      const endTime = new Date();
      const timeToScore = (endTime - pickupTime) / 1000;
      teleOpNoteData += saveAsCSV([scoringLocation, timeToPickup, timeToScore]);
      if(teleOpNoteData.substring(0, 9) == "undefined"){
        teleOpNoteData = teleOpNoteData.substring(9);
      };
    }

    heldNote = null;
    pickupTime = null;

    document.getElementById('pickUpB').classList.remove('disabled');
    document.getElementById('speakerB').classList.add('disabled');
    document.getElementById('ampB').classList.add('disabled');
    document.getElementById('droppedB').classList.add('disabled');
    document.getElementById('trapB').classList.add('disabled');
  }

  function climb() {
    var climbStart = new Date();
    climbStartTime = (climbStart - startTime)/1000;
  }

  function nextPage2() {
    qrData2 = saveAsCSV([startPos, autoNoteData]);
    console.log(qrData2);
    qrData = qrData1 + qrData2 + qrData3 + qrData4;
    console.log(qrData);
    document.getElementById('page3').classList.remove('hidden');
    document.getElementById('page2').classList.add('hidden');

    //if a note is brought to teleOp:
    if(heldNote){
      heldNote == null;
      document.getElementById('pickUpB').classList.add('disabled');
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
    qrData3 = saveAsCSV(["teleOp", teleOpNoteData]) + saveAsCSV(["endgame", trapCount, climbStartTime]);
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
    var failsList;
    for(var i in failsSelected) {
      failsList += failsSelected[i] + " | ";
    };
    if(failsList == "undefined"){
      failsList == "no fails";
    };

    qrData4 = saveAsCSV([pickupMethod, climbStatus]) + saveAsCSV([failsList]) + saveAsCSV([otherInfo])
    console.log(qrData4);
    qrData = qrData1 + qrData2 + qrData3 + qrData4;
    document.getElementById('page5').classList.remove('hidden');
    document.getElementById('page4').classList.add('hidden');
    setQrData(qrData);
    console.log(qrData);

  }

  return (
    <div className="app">
      <div class="page page1" id="page1">
        {/* event, role, name, match, robot */}
        <h1>AEMScout</h1>
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
            <input type="text" id="match" required></input>
          </div>
        </form>
        <button class="bButton" id="getRobotButton" onClick={() => assignRobot()}>GET ROBOT</button>
        <h3 id="startMessage"></h3>
        <button class="bButton hidden" id="nextPage1Button" onClick={() => nextPage1()}>NEXT PAGE</button>
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
        <button class="scored" id="droppedButton" onClick={() => droppedNote()}>Dropped</button>
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
        <button class="scored disabled" id="droppedB" onClick={() => droppedNote()}>Dropped</button>
        <button class="scored disabled" id="trapB" onClick={() => scoredTrap()}>Trap</button>

        <button class="scored" onClick={() => climb()}>Climb</button>
        
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
                <option value="ground and source" selected>Ground and Source</option>
                <option value="ground only">Ground only</option>
                <option value="source only">Source only</option>
                <option value="none">none</option>
            </select>
          </div>
          <p></p>
          <div class="question">
            <label for="climbStatus">CLIMB </label>
            <select name="climbStatus" id="climbStatus" required>
                <option value="no attempt">No Attempt</option>
                <option value="climb success">success</option>
                <option value="climb failed">failed</option>
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
        <button onClick={() => setShowQR(true)}>Generate QR Code</button>
        <QRModal
          show={showQR}
          title={qrTitle}
          data={finalData}
          onDismiss={() => setShowQR(false)}
        />
      </div>
    </div>
  );
}

export default App;

