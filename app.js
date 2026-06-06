import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// System Cryptography Tokens
const CHOSEN_ACCESS_CODE = "FAMILY2026";

// Extended Database Structure mapping Countries to ISO codes for FlagCDN integration
const MASTER_TEAMS_POOL = {
    "Argentina": "ar", "France": "fr", "England": "gb", "Brazil": "br", 
    "Spain": "es", "Portugal": "pt", "Netherlands": "nl", "Belgium": "be",
    "Germany": "de", "Italy": "it", "Croatia": "hr", "Morocco": "ma", 
    "Uruguay": "uy", "Colombia": "co", "USA": "us", "Mexico": "mx",
    "Senegal": "sn", "Japan": "jp", "South Korea": "kr", "Iran": "ir", 
    "Denmark": "dk", "Switzerland": "ch", "Ukraine": "ua", "Poland": "pl",
    "Sweden": "se", "Austria": "at", "Nigeria": "ng", "Ivory Coast": "ci", 
    "Egypt": "eg", "Australia": "au", "Saudi Arabia": "sa", "Canada": "ca"
};

const TEAM_NAMES = Object.keys(MASTER_TEAMS_POOL);

// Core configuration payload link
const firebaseConfig = {
    apiKey: "AIzaSyDrNntF6albNaqPLp5PhJ48cSFMJ8KQhZY",
    authDomain: "world-cup-d01ef.firebaseapp.com",
    projectId: "world-cup-d01ef",
    storageBucket: "world-cup-d01ef.firebasestorage.app",
    messagingSenderId: "437915295717",
    appId: "1:437915295717:web:fc9504279218e66e74190c",
    measurementId: "G-Z5NRSG3QK0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let authWorkflowStage = "gate-auth-code";
let userSessionIdentity = "";
let remoteClaimsState = {};
let fixturesMasterCache = [];

// DOM References
const gateScreen = document.getElementById("gate-screen");
const appScreen = document.getElementById("app-screen");
const accessCodeInput = document.getElementById("access-code");
const userNameInput = document.getElementById("user-name");
const btnGate = document.getElementById("btn-gate");
const userDisplay = document.getElementById("user-display");

// Parallax Mobile Gyro Mechanical Physics Emulator
const parallaxElement = document.getElementById("picker-zone");
if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener("deviceorientation", handleGyroscopeMovement);
} else {
    // Desktop Fallback Mouse Interceptor
    document.addEventListener("mousemove", (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const rx = (cy - e.clientY) / 15;
        const ry = (e.clientX - cx) / 15;
        parallaxElement.style.setProperty("--rx", `${rx}deg`);
        parallaxElement.style.setProperty("--ry", `${ry}deg`);
    });
}

function handleGyroscopeMovement(e) {
    const rx = Math.min(Math.max(e.beta - 45, -20), 20) / 1.5;
    const ry = Math.min(Math.max(e.gamma, -20), 20) / 1.5;
    parallaxElement.style.setProperty("--rx", `${rx}deg`);
    parallaxElement.style.setProperty("--ry", `${ry}deg`);
}

// Security Gate Logical Processing Flow
btnGate.addEventListener("click", () => {
    if (authWorkflowStage === "gate-auth-code") {
        if (accessCodeInput.value.trim().toUpperCase() === CHOSEN_ACCESS_CODE) {
            accessCodeInput.classList.add("hidden");
            userNameInput.classList.remove("hidden");
            userNameInput.focus();
            btnGate.textContent = "Confirm Identity Entry";
            authWorkflowStage = "gate-auth-name";
        } else {
            alert("Security failure: Validation token invalid.");
            accessCodeInput.value = "";
        }
    } else if (authWorkflowStage === "gate-auth-name") {
        const rawName = userNameInput.value.trim();
        if (rawName.length < 2) return;
        userSessionIdentity = rawName;
        localStorage.setItem("wc_user_identity_v2", userSessionIdentity);
        executeSystemActivation();
    }
});

if (localStorage.getItem("wc_user_identity_v2")) {
    userSessionIdentity = localStorage.getItem("wc_user_identity_v2");
    setTimeout(() => { executeSystemActivation(); }, 300);
}

function executeSystemActivation() {
    gateScreen.classList.add("opacity-0", "pointer-events-none");
    appScreen.classList.remove("hidden");
    userDisplay.textContent = `Driver: ${userSessionIdentity}`;
    
    // Mount Cloud Listeners
    syncClaimsPipeline();
    syncFixturesPipeline();
}

// Tab Deck Switching Core Loop Controller
document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
        const currentBtn = e.currentTarget;
        document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".app-view").forEach(v => v.classList.add("hidden"));
        
        currentBtn.classList.add("active");
        document.getElementById(currentBtn.dataset.target).classList.remove("hidden");
        document.getElementById("header-title").textContent = currentBtn.dataset.title;
    });
});

// Real-Time Listener: Claims sync
function syncClaimsPipeline() {
    onSnapshot(collection(db, "family_claims"), (snapshot) => {
        remoteClaimsState = {};
        snapshot.forEach(doc => {
            remoteClaimsState[doc.id] = doc.data().claimedBy;
        });
        renderRosterInterface();
        evaluateSessionLockState();
    });
}

function renderRosterInterface() {
    const container = document.getElementById("claims-list");
    container.innerHTML = "";
    
    TEAM_NAMES.forEach(team => {
        const handler = remoteClaimsState[team];
        const flagCode = MASTER_TEAMS_POOL[team];
        const node = document.createElement("div");
        
        node.className = `glass-panel px-4 py-3 rounded-2xl flex justify-between items-center transition-all ${handler ? 'border-white/5 bg-white/[0.01] opacity-40' : 'border-white/10'}`;
        node.innerHTML = `
            <div class="flex items-center space-x-3">
                <img src="https://flagcdn.com/w40/${flagCode}.png" class="w-7 h-5 rounded object-cover shadow-sm" alt="">
                <span class="font-bold text-sm ${handler ? 'text-slate-400 line-through' : 'text-white'}">${team}</span>
            </div>
            <span class="text-[10px] font-bold px-3 py-1 rounded-xl font-mono tracking-wider ${handler ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}">
                ${handler ? handler.toUpperCase() : 'VACANT'}
            </span>
        `;
        container.appendChild(node);
    });
}

function evaluateSessionLockState() {
    let claimedFaction = null;
    for (const [team, user] of Object.entries(remoteClaimsState)) {
        if (user.toLowerCase() === userSessionIdentity.toLowerCase()) {
            claimedFaction = team;
            break;
        }
    }
    
    const pZone = document.getElementById("picker-zone");
    const lZone = document.getElementById("locked-zone");
    
    if (claimedFaction) {
        pZone.classList.add("hidden");
        lZone.classList.remove("hidden");
        document.getElementById("my-locked-team").textContent = claimedFaction.toUpperCase();
        document.getElementById("my-locked-flag").style.backgroundImage = `url('https://flagcdn.com/w80/${MASTER_TEAMS_POOL[claimedFaction]}.png')`;
        document.getElementById("my-locked-flag").style.backgroundSize = "cover";
        
        document.getElementById("no-team-assigned").classList.add("hidden");
        document.getElementById("myteam-dashboard").classList.remove("hidden");
        document.getElementById("dashboard-team-name").textContent = claimedFaction.toUpperCase();
        document.getElementById("dash-flag").style.backgroundImage = `url('https://flagcdn.com/w160/${MASTER_TEAMS_POOL[claimedFaction]}.png')`;
        document.getElementById("dash-flag").style.backgroundSize = "cover";
        
        filterPersonalFixtures(claimedFaction);
    } else {
        pZone.classList.remove("hidden");
        lZone.classList.add("hidden");
    }
}

// High Fidelity Random Spinner Engine Logic
const btnDraw = document.getElementById("btn-draw");
const pickerDisplay = document.getElementById("picker-display");
const flagDisplay = document.getElementById("flag-display");
const pickerSub = document.getElementById("picker-sub");

btnDraw.addEventListener("click", () => {
    const unallocated = TEAM_NAMES.filter(t => !remoteClaimsState[t]);
    if (unallocated.length === 0) return alert("All teams claimed!");
    
    btnDraw.disabled = true;
    btnDraw.classList.add("opacity-30");
    pickerDisplay.classList.add("blur-roll");
    flagDisplay.classList.remove("hidden");
    
    let spinCounts = 0;
    const mechanicalInterval = setInterval(() => {
        const temporaryTeam = unallocated[Math.floor(Math.random() * unallocated.length)];
        pickerDisplay.textContent = temporaryTeam.toUpperCase();
        flagDisplay.style.backgroundImage = `url('https://flagcdn.com/w80/${MASTER_TEAMS_POOL[temporaryTeam]}.png')`;
        flagDisplay.style.backgroundSize = "cover";
        spinCounts++;
        
        if (spinCounts > 20) {
            clearInterval(mechanicalInterval);
            const selectionTarget = unallocated[Math.floor(Math.random() * unallocated.length)];
            
            pickerDisplay.classList.remove("blur-roll");
            pickerDisplay.textContent = selectionTarget.toUpperCase();
            pickerDisplay.className = "text-4xl font-black tracking-tight text-amber-400 scale-105 transition-all";
            pickerSub.textContent = "LOCKING DATABASE ENTRY...";
            
            setDoc(doc(db, "family_claims", selectionTarget), {
                claimedBy: userSessionIdentity,
                timestamp: new Date().toISOString()
            }).then(() => {
                btnDraw.disabled = false;
                btnDraw.classList.remove("opacity-30");
            });
        }
    }, 90);
});

// Dynamic Fixtures Core Framework Database Fallback Sync
function syncFixturesPipeline() {
    onSnapshot(collection(db, "worldcup_fixtures"), (snapshot) => {
        fixturesMasterCache = [];
        snapshot.forEach(doc => fixturesMasterCache.push(doc.data()));
        
        if (fixturesMasterCache.length === 0) {
            // Built-In Official Match Template
            fixturesMasterCache = [
                { stage: "Group A", homeTeam: "Mexico", awayTeam: "USA", homeScore: 2, awayScore: 1, date: "June 11" },
                { stage: "Group B", homeTeam: "England", awayTeam: "Canada", homeScore: 3, awayScore: 0, date: "June 12" },
                { stage: "Group C", homeTeam: "Argentina", awayTeam: "Sweden", homeScore: 1, awayScore: 0, date: "June 12" },
                { stage: "Group D", homeTeam: "France", awayTeam: "Japan", homeScore: 2, awayScore: 2, date: "June 13" },
                { stage: "Group E", homeTeam: "Brazil", awayTeam: "Morocco", homeScore: 0, awayScore: 1, date: "June 14" },
                { stage: "Group F", homeTeam: "Spain", awayTeam: "Colombia", homeScore: 4, awayScore: 2, date: "June 15" }
            ];
        }
        renderAllFixtures();
    });
}

function renderAllFixtures() {
    const list = document.getElementById("fixtures-list");
    list.innerHTML = "";
    fixturesMasterCache.forEach(match => list.appendChild(generateMatchCardDOMNode(match)));
}

function filterPersonalFixtures(targetTeam) {
    const list = document.getElementById("my-fixtures-list");
    list.innerHTML = "";
    const filtered = fixturesMasterCache.filter(m => 
        m.homeTeam.toLowerCase() === targetTeam.toLowerCase() || 
        m.awayTeam.toLowerCase() === targetTeam.toLowerCase()
    );
    if(filtered.length === 0) {
        list.innerHTML = `<div class="text-slate-500 text-xs py-6 text-center">No structural logs recorded yet.</div>`;
        return;
    }
    filtered.forEach(match => list.appendChild(generateMatchCardDOMNode(match)));
}

function generateMatchCardDOMNode(match) {
    const el = document.createElement("div");
    el.className = "glass-panel p-4 rounded-2xl space-y-4 relative overflow-hidden";
    
    const hCode = MASTER_TEAMS_POOL[match.homeTeam] || "un";
    const aCode = MASTER_TEAMS_POOL[match.awayTeam] || "un";
    
    el.innerHTML = `
        <div class="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-slate-400 border-b border-white/5 pb-2">
            <span class="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">${match.stage}</span>
            <span class="font-mono">${match.date}</span>
        </div>
        <div class="space-y-2.5">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <img src="https://flagcdn.com/w40/${hCode}.png" class="w-6 h-4 rounded object-cover shadow-sm">
                    <span class="text-sm font-bold text-white tracking-wide">${match.homeTeam}</span>
                </div>
                <span class="font-mono font-black text-lg text-white">${match.homeScore}</span>
            </div>
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <img src="https://flagcdn.com/w40/${aCode}.png" class="w-6 h-4 rounded object-cover shadow-sm">
                    <span class="text-sm font-bold text-white tracking-wide">${match.awayTeam}</span>
                </div>
                <span class="font-mono font-black text-lg text-white">${match.awayScore}</span>
            </div>
        </div>
    `;
    return el;
}
