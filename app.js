import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Global Environment Variable Passwords
const CHOSEN_ACCESS_CODE = "FAMILY2026"; 

// 32 Teams Pool Array
const WORLD_CUP_TEAMS = [
    "Argentina", "France", "England", "Brazil", "Spain", "Portugal", "Netherlands", "Belgium",
    "Germany", "Italy", "Croatia", "Morocco", "Uruguay", "Colombia", "USA", "Mexico",
    "Senegal", "Japan", "South Korea", "Iran", "Denmark", "Switzerland", "Ukraine", "Poland",
    "Sweden", "Austria", "Nigeria", "Ivory Coast", "Egypt", "Australia", "Saudi Arabia", "Canada"
];

// Firebase Web SDK Pipeline Credentials
const firebaseConfig = {
    apiKey: "AIzaSyDrNntF6albNaqPLp5PhJ48cSFMJ8KQhZY",
    authDomain: "world-cup-d01ef.firebaseapp.com",
    projectId: "world-cup-d01ef",
    storageBucket: "world-cup-d01ef.firebasestorage.app",
    messagingSenderId: "437915295717",
    appId: "1:437915295717:web:fc9504279218e66e74190c",
    measurementId: "G-Z5NRSG3QK0"
};

// Initialize Modules
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Application Execution States
let currentStage = "gate-auth-code"; 
let localUserSessionName = "";
let registeredClaimsData = {};

// Cache DOM elements
const gateScreen = document.getElementById("gate-screen");
const appScreen = document.getElementById("app-screen");
const accessCodeInput = document.getElementById("access-code");
const userNameInput = document.getElementById("user-name");
const btnGate = document.getElementById("btn-gate");
const userDisplay = document.getElementById("user-display");

// Step Engine Authentication Gate 
btnGate.addEventListener("click", () => {
    if (currentStage === "gate-auth-code") {
        if (accessCodeInput.value.trim() === CHOSEN_ACCESS_CODE) {
            accessCodeInput.classList.add("hidden");
            userNameInput.classList.remove("hidden");
            userNameInput.focus();
            btnGate.textContent = "Confirm Identity & Enter";
            currentStage = "gate-auth-name";
        } else {
            alert("Incorrect access token code. Try again.");
            accessCodeInput.value = "";
        }
    } else if (currentStage === "gate-auth-name") {
        const inputName = userNameInput.value.trim();
        if (inputName.length < 2) {
            alert("Please input a recognizable family name.");
            return;
        }
        localUserSessionName = inputName;
        localStorage.setItem("wc_user_name", localUserSessionName);
        initializeAppInterface();
    }
});

// Auto login if already validated inside memory architecture
if(localStorage.getItem("wc_user_name")) {
    localUserSessionName = localStorage.getItem("wc_user_name");
    // Speed directly into app screen bounds
    setTimeout(() => { initializeAppInterface(); }, 400);
}

function initializeAppInterface() {
    gateScreen.classList.add("opacity-0", "pointer-events-none");
    appScreen.classList.remove("hidden");
    userDisplay.textContent = `Hub Driver: ${localUserSessionName}`;
    
    // Connect Live Sync Listeners
    syncClaimsEngine();
    syncFixturesEngine();
}

// Tab Switching Controller Engine
document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
        const targetBtn = e.currentTarget;
        document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".app-view").forEach(v => v.classList.add("hidden"));
        
        targetBtn.classList.add("active");
        document.getElementById(targetBtn.dataset.target).classList.remove("hidden");
        document.getElementById("header-title").textContent = targetBtn.dataset.title;
    });
});

// Real-Time Firebase Sync for Faction Claims
function syncClaimsEngine() {
    onSnapshot(collection(db, "family_claims"), (snapshot) => {
        registeredClaimsData = {};
        snapshot.forEach(doc => {
            registeredClaimsData[doc.id] = doc.data().claimedBy;
        });
        
        renderClaimsBoard();
        evaluateUserClaimState();
    });
}

function renderClaimsBoard() {
    const listContainer = document.getElementById("claims-list");
    listContainer.innerHTML = "";
    
    WORLD_CUP_TEAMS.forEach(team => {
        const claimer = registeredClaimsData[team];
        const row = document.createElement("div");
        row.className = `glass-panel px-4 py-3.5 rounded-2xl flex justify-between items-center transition-all ${claimer ? 'border-indigo-500/10 bg-indigo-950/5 opacity-60' : 'border-white/5'}`;
        
        row.innerHTML = `
            <span class="font-bold text-sm tracking-wide ${claimer ? 'text-slate-400' : 'text-white'}">${team}</span>
            <span class="text-xs px-2.5 py-1 rounded-lg font-mono tracking-wider uppercase font-bold ${claimer ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'}">
                ${claimer ? claimer : 'Available'}
            </span>
        `;
        listContainer.appendChild(row);
    });
}

function evaluateUserClaimState() {
    let ownedTeam = null;
    for (const [team, person] of Object.entries(registeredClaimsData)) {
        if (person.toLowerCase() === localUserSessionName.toLowerCase()) {
            ownedTeam = team;
            break;
        }
    }
    
    const pickerZone = document.getElementById("picker-zone");
    const lockedZone = document.getElementById("locked-zone");
    
    if (ownedTeam) {
        pickerZone.classList.add("hidden");
        lockedZone.classList.remove("hidden");
        document.getElementById("my-locked-team").textContent = ownedTeam;
        
        // Populate Personal Progress Dashboards
        document.getElementById("no-team-assigned").classList.add("hidden");
        const dash = document.getElementById("myteam-dashboard");
        dash.classList.remove("hidden");
        document.getElementById("dashboard-team-name").textContent = ownedTeam;
        filterPersonalFixtures(ownedTeam);
    } else {
        pickerZone.classList.remove("hidden");
        lockedZone.classList.add("hidden");
    }
}

// Randomizer Slot Machine Mechanical Drawer Engine
const btnDraw = document.getElementById("btn-draw");
const pickerDisplay = document.getElementById("picker-display");
const pickerSub = document.getElementById("picker-sub");

btnDraw.addEventListener("click", () => {
    // Collect non-assigned factions
    const unallocated = WORLD_CUP_TEAMS.filter(t => !registeredClaimsData[t]);
    
    if (unallocated.length === 0) {
        alert("Fatal Error: No squads left inside pool allocation.");
        return;
    }
    
    btnDraw.disabled = true;
    btnDraw.classList.add("opacity-40");
    pickerDisplay.classList.add("blur-roll");
    pickerSub.textContent = "Spinning Reel Pipeline...";
    
    let iterations = 0;
    const interval = setInterval(() => {
        const dummyIndex = Math.floor(Math.random() * unallocated.length);
        pickerDisplay.textContent = unallocated[dummyIndex].toUpperCase();
        iterations++;
        
        if (iterations > 15) {
            clearInterval(interval);
            
            // Finalize targeted calculation selection
            const ultimateIndex = Math.floor(Math.random() * unallocated.length);
            const finalSelection = unallocated[ultimateIndex];
            
            pickerDisplay.classList.remove("blur-roll");
            pickerDisplay.textContent = finalSelection.toUpperCase();
            pickerDisplay.className = "text-3xl font-black tracking-wide text-teal-400";
            pickerSub.textContent = "Writing Matrix Node...";
            
            // Commit to Firebase async to securely establish dynamic registration lock out
            setDoc(doc(db, "family_claims", finalSelection), {
                claimedBy: localUserSessionName,
                timestamp: new Date().toISOString()
            }).then(() => {
                btnDraw.disabled = false;
                btnDraw.classList.remove("opacity-40");
            }).catch(err => {
                alert("Database concurrency crash: Try spinning process again.");
                btnDraw.disabled = false;
            });
        }
    }, 120);
});

// Dynamic Fixtures Sync Layer 
let mockFixturesMasterDatabase = [];

function syncFixturesEngine() {
    // Real World Cup Matches mapping pipeline structure array 
    onSnapshot(collection(db, "worldcup_fixtures"), (snapshot) => {
        mockFixturesMasterDatabase = [];
        snapshot.forEach(doc => {
            mockFixturesMasterDatabase.push(doc.data());
        });
        
        // If your database cluster returns blank values, fallback to generic structural defaults:
        if(mockFixturesMasterDatabase.length === 0) {
            mockFixturesMasterDatabase = [
                { stage: "Group Stage", homeTeam: "Argentina", awayTeam: "Canada", homeScore: 2, awayScore: 0, date: "June 15" },
                { stage: "Group Stage", homeTeam: "France", awayTeam: "Poland", homeScore: 1, awayScore: 1, date: "June 16" },
                { stage: "Group Stage", homeTeam: "England", awayTeam: "USA", homeScore: 3, awayScore: 1, date: "June 17" },
                { stage: "Group Stage", homeTeam: "Brazil", awayTeam: "Japan", homeScore: 0, awayScore: 0, date: "June 18" }
            ];
        }
        
        renderAllFixturesList();
        
        // re-evaluate personal panel filter properties if needed
        let ownedTeam = null;
        for (const [team, person] of Object.entries(registeredClaimsData)) {
            if (person.toLowerCase() === localUserSessionName.toLowerCase()) { ownedTeam = team; break; }
        }
        if(ownedTeam) filterPersonalFixtures(ownedTeam);
    });
}

function renderAllFixturesList() {
    const list = document.getElementById("fixtures-list");
    list.innerHTML = "";
    
    mockFixturesMasterDatabase.forEach(match => {
        list.appendChild(createFixtureCardDOMElement(match));
    });
}

function filterPersonalFixtures(teamName) {
    const list = document.getElementById("my-fixtures-list");
    list.innerHTML = "";
    
    const userMatches = mockFixturesMasterDatabase.filter(m => 
        m.homeTeam.toLowerCase() === teamName.toLowerCase() || 
        m.awayTeam.toLowerCase() === teamName.toLowerCase()
    );
    
    if(userMatches.length === 0) {
        list.innerHTML = `<div class="text-slate-500 text-xs py-4 text-center">No matches recorded for your team asset pool yet.</div>`;
        return;
    }
    
    userMatches.forEach(match => {
        list.appendChild(createFixtureCardDOMElement(match));
    });
}

function createFixtureCardDOMElement(match) {
    const card = document.createElement("div");
    card.className = "glass-panel p-4 rounded-2xl space-y-3";
    card.innerHTML = `
        <div class="flex justify-between items-center text-[10px] tracking-wider uppercase font-bold text-slate-400">
            <span class="bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">${match.stage}</span>
            <span class="font-mono text-slate-500">${match.date || 'TBD'}</span>
        </div>
        <div class="grid grid-cols-12 items-center font-semibold text-sm">
            <div class="col-span-9 text-white tracking-wide">${match.homeTeam}</div>
            <div class="col-span-3 text-right font-mono font-black text-slate-200 text-base">${match.homeScore}</div>
            <div class="col-span-9 text-white tracking-wide mt-1">${match.awayTeam}</div>
            <div class="col-span-3 text-right font-mono font-black text-slate-200 text-base mt-1">${match.awayScore}</div>
        </div>
    `;
    return card;
}
