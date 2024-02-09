import { useState } from 'react'
import './App.css'
import QRModal from './QRModal';

function App() {
  localStorage.removeItem("schedule");
  const [showQR, setShowQR] = useState(false);
  const [finalData, setQrData] = useState(''); // Initialize qrData as a state variable
  
  //placeholders
  const qrTitle = "Example QR Code";
  var qrData = "";
  var qrData1 = "";
  var qrData2 = "";
  var startTime, startPos, autoNoteData;
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
    if(data.substring(0, 9) == "undefined"){
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
    console.log(qrData);
    qrData = qrData1 + qrData2 + qrData3 + qrData4;

    //unhide next page
    document.getElementById('page2').classList.remove('hidden');
    document.getElementById('page1').classList.add('hidden');
    if(role[0] == "b") {
      document.getElementById('fieldIMG').src = "./blueField.png";
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
      document.getElementById('fieldIMG').src = "./redField.png";
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
    //log starting position
    startPos = startingPos;
    qrData2 = startTime + startPos + autoNoteData;
  }

  function logNote(note) {
    //a note is picked up
    pickupTime = new Date();
    if(note){heldNote = note;}
    
    timeToPickup = (pickupTime - startTime) / 1000;
  }

  function droppedNote() {
    const scoringLocation = "dropped";
    const endTime = new Date();
    const timeToScore = (endTime - pickupTime) / 1000;
    
    if(heldNote) {
      autoNoteData += saveAsCSV([heldNote, scoringLocation, timeToPickup, timeToScore]);
      if(autoNoteData.substring(0, 9) == "undefined"){
        autoNoteData = autoNoteData.substring(9);
      };
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
  }

  function scoredNote(place) {
    const scoringLocation = place;
    const endTime = new Date();
    const timeToScore = (endTime - pickupTime) / 1000;
    if(heldNote){
      autoNoteData += saveAsCSV([heldNote, scoringLocation, timeToPickup, timeToScore]);
      if(autoNoteData.substring(0, 9) == "undefined"){
        autoNoteData = autoNoteData.substring(9);
      };
      console.log(autoNoteData);
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
  }

  function trap() {
    trapCount++;
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
      document.getElementById('fieldIMG').src = "./blueField.png";
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
      document.getElementById('fieldIMG').src = "./redField.png";
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
  }

  function nextPage3() {
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


  function nextPage4() {
    var failSelected = document.getElementById('CFL').value;
    qrData4 = saveAsCSV([failSelected]);
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
        <form>
          <div class="question">
            <label for="event">Event: </label>
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
            <label for="role">Role: </label>
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
            <label for="initials">Scouter Initials: </label>
            <input type="text" id="initials" required></input>
          </div>
          <div class="question">
            <label for="match">Match: </label>
            <input type="text" id="match" required></input>
          </div>
        </form>
        <button onClick={() => assignRobot()}>Get Robot</button>
        <h3 id="startMessage"></h3>
        <button id="nextPage1Button" class="hidden" onClick={() => nextPage1()}>next page</button>
      </div>

      <div class="page hidden page2" id="page2">
        {/* auto (map) mobilityInAuto automatically checks if game piece is pressed*/}
        <div class="topButtons">
          <button class="back" onClick={() => lastPage1()}><i class="fa-solid fa-arrow-left"></i></button>
          <button id="startAuto" onClick={() => startAuto()}>start auto</button>
          <button class="forward" onClick={() => nextPage2()}><i class="fa-solid fa-arrow-right"></i></button>
        </div>
        <div class="imgContainer">
          <img id="fieldIMG" alt="field image"></img>
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
      </div>

      <div class="page hidden page3" id="page3">
        {/* teleop (speaker, amp, pickup, drop, trap, climb) */}
        <div class="topButtons">
          <button class="back" onClick={() => lastPage2()}><i class="fa-solid fa-arrow-left"></i></button>
          <h3>TeleOp</h3>
          <button class="forward" onClick={() => nextPage3()}><i class="fa-solid fa-arrow-right"></i></button>
        </div>
        
        <button class="scored" id="b3" onClick={() => logNote()}>Pickup</button>
        <button class="scored" onClick={() => scoredNote("speaker")}>Scored in speaker</button>
        <button class="scored" onClick={() => scoredNote("amp")}>Scored in Amp</button>
        <button class="scored" onClick={() => droppedNote()}>Dropped</button>
        
        <button class="scored" onClick={() => trap()}>Trap</button>
        <button class="scored" onClick={() => climb()}>Climb</button>
      </div>

      <div class="page hidden page4" id="page4">
        {/* fouls, fail(climb), CFL (common fail list), Other, Pickup? */}
        <div class="topButtons">
          <button class="back" onClick={() => lastPage3()}><i class="fa-solid fa-arrow-left"></i></button>
          <h3>Comments</h3>
          <button class="forward" onClick={() => nextPage4()}><i class="fa-solid fa-arrow-right"></i></button>
        </div>

        <form>
          <label for="CFL">Fails: </label>
          <select name="CFL" id="CFL" required>
              {/* get event_key from URL */}
              <option value="robot exploded">Robot exploded</option>
              <option value="sean sucks">Sean Sucks At Mario Kart</option>
          </select>
        </form>
      </div>

      <div class="page hidden page5" id="page5">
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

