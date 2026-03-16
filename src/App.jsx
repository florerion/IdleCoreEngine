import React, { useState, useEffect, useRef } from 'react';
import { getNewGameState, getInitialOwned, getInitialUpgrades, getInitialAchievementData } from './data/gameData';
import { BUILDINGS } from "./data/buildings";
import { UPGRADES } from "./data/upgrades";
import { calculateCurrentGPS, getBuildingCost } from './logic/gameLogic';
import ProgressButton from './components/ProgressButton';
import BuildingProgressBar from './components/BuildingProgressBar';
import Logger from './components/Logger';
import './App.css';
import * as Icons from 'lucide-react'; // Importuje wszystkie ikony
import { pl } from './locales/pl';
import { en } from './locales/en';
import { checkAchievements, applyAchievementReward } from './logic/gameLogic';
import AchievementsList from './components/AchievementsList';
import AchievementNotification from "./components/AchievementNotification";
import { ACHIEVEMENTS } from "./data/achievements";

const TRANSLATIONS = { pl, en };

function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [logs, setLogs] = useState(["Systemy aktywne..."]);
  const [displayGold, setDisplayGold] = useState(0);
  const [displayGPS, setDisplayGPS] = useState(0);
  const [lang, setLang] = useState('pl'); // Domyślny język
  const [notifications, setNotifications] = useState([]);

  // Helper do tłumaczeń
  const t = (path) => {
    // path np. "ui.gold" -> zwraca TRANSLATIONS['pl']['ui']['gold']
    return path.split('.').reduce((obj, key) => obj?.[key], TRANSLATIONS[lang]) || path;
  };

  // Funkcja do zmiany języka
  const toggleLang = () => setLang(prev => prev === 'pl' ? 'en' : 'pl');

  const gameData = useRef(getNewGameState());

  const addLog = (m) => setLogs(p => [m, ...p].slice(0, 5));

  // Helper do pokazania notyfikacji
  const showAchievementNotification = (achievementId) => {
    const ach = ACHIEVEMENTS[achievementId];
    const newNotif = {
      id: achievementId,
      name: ach.name,
      icon: ach.icon,
      reward: ach.reward,
      timestamp: Date.now()
    };
    setNotifications(prev => [...prev, newNotif]);
    
    // Auto-usuń po 5 sekundach
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== achievementId));
    }, 5000);
  };

  // --- LOGIKA TICKA, OFFLINE I ZAPISU ---
  useEffect(() => {
    const saved = localStorage.getItem('idleGameSave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const secondsAway = Math.floor((now - (parsed.lastUpdate || now)) / 1000);

        const freshOwned = getInitialOwned();
        const freshUpgrades = getInitialUpgrades();
        const freshAchievements = getInitialAchievementData();
        
        gameData.current = {
          ...gameData.current,
          ...parsed,
          owned: { ...freshOwned, ...parsed.owned },
          upgrades: { ...freshUpgrades, ...parsed.upgrades },
          achievementData: { ...freshAchievements, ...parsed.achievementData },
          lastUpdate: now
        };

        if (secondsAway > 10) {
          const gps = calculateCurrentGPS(gameData.current);
          const earned = Math.floor(gps * secondsAway);
          if (earned > 0) {
            gameData.current.gold += earned;
            addLog(`Zarobek offline: ${earned.toLocaleString()} 💰`);
          }
        }
      } catch (e) { console.error("Błąd wczytywania", e); }
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - gameData.current.lastUpdate) / 1000;
      gameData.current.lastUpdate = now;
      
      const gps = calculateCurrentGPS(gameData.current);
      gameData.current.gps = gps;
      gameData.current.gold += (gps * dt);
      
      setDisplayGold(Math.floor(gameData.current.gold));
      setDisplayGPS(gps);
    }, 50);

    // Osobny interval do sprawdzania achievements - 1000ms
    const achievementCheckInterval = setInterval(() => {
      const newAchievements = checkAchievements(gameData.current);
      newAchievements.forEach(achId => {
        applyAchievementReward(gameData.current, achId);
        showAchievementNotification(achId);
      });
    }, 1000);

    const saveInt = setInterval(() => {
      localStorage.setItem('idleGameSave', JSON.stringify(gameData.current));
    }, 5000);

    return () => { 
      clearInterval(interval); 
      clearInterval(achievementCheckInterval);
      clearInterval(saveInt); };
  }, []);

  // --- AKCJE ZAKUPU ---
  const handleBuyBuilding = (id) => {
    const cost = getBuildingCost(id, gameData.current.owned[id]);
    if (gameData.current.gold >= cost) {
      gameData.current.gold -= cost;
      gameData.current.owned[id] += 1;
      addLog(`Kupiono: ${BUILDINGS[id].name}`);

      const newAchievements = checkAchievements(gameData.current);
      newAchievements.forEach(achId => {
        applyAchievementReward(gameData.current, achId);
        showAchievementNotification(achId);
      });
    }
  };

  const handleBuyUpgrade = (id) => {
    const upg = UPGRADES[id];
    if (gameData.current.gold >= upg.cost && !gameData.current.upgrades[id]) {
      gameData.current.gold -= upg.cost;
      gameData.current.upgrades[id] = true;
      if (upg.type === 'click') gameData.current.clickPower *= upg.multiplier;
      if (upg.type === 'global') gameData.current.globalMultiplier *= upg.multiplier;
      addLog(`Odblokowano: ${upg.name}`);

      const newAchievements = checkAchievements(gameData.current);
      newAchievements.forEach(achId => {
        applyAchievementReward(gameData.current, achId);
        showAchievementNotification(achId);
      });
    }
  };

  const handlePrestige = () => {
    const gain = calculatePrestigeGain(gameData.current.gold);
    
    // 1. Sprawdzamy czy w ogóle można (walidacja)
    if (gain <= 0) {
      addLog("Za mało złota na wykonanie prestiżu!");
      return;
    }

    // 2. WYMAGANE POTWIERDZENIE
    const confirmMsg = `Czy na pewno chcesz wykonać Prestiż?\n\n` +
                      `Stracisz wszystkie budynki i złoto, ale otrzymasz +${gain} pkt Prestiżu.\n` +
                      `Twoja produkcja wzrośnie o kolejne ${(gain * 10)}%!`;

    if (window.confirm(confirmMsg)) {
      const totalPoints = (gameData.current.prestigePoints || 0) + gain;
      
      // 3. GENERUJEMY NOWY STAN (korzystając z bezpiecznej funkcji-wzorca)
      const newState = getNewGameState(); 
      
      gameData.current = {
        ...newState,
        prestigePoints: totalPoints,
        prestigeMultiplier: 1 + (totalPoints * 0.1), // Każdy pkt to +10%
        lastUpdate: Date.now()
      };

      // 4. RESET UI I POWIADOMIENIE
      setLogs([`ERA ${totalPoints} ROZPOCZĘTA!`, `Mnożnik prestiżu: x${gameData.current.prestigeMultiplier.toFixed(1)}`, ...logs].slice(0, 5));
      setCurrentView('main');
      
      // Opcjonalnie: wymuszamy zapis natychmiast po prestiżu
      localStorage.setItem('idleGameSave', JSON.stringify(gameData.current));
    }
  };

  // --- DEFINICJE WIDOKÓW ---
  const VIEWS = {
    menu: () => (
      <div className="text-center py-5 bg-light rounded shadow-sm border mt-4">
        <h1 className="display-4">Idle Core Engine</h1>
        <div className="d-grid gap-2 col-md-4 mx-auto mt-4">
          <button className="btn btn-primary btn-lg shadow" onClick={() => setCurrentView('main')}>
            {displayGold > 0 ? "Kontynuuj" : "Graj"}
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => { localStorage.clear(); window.location.reload(); }}>Resetuj zapis</button>
          <div className="mt-4 border-top pt-3">
            <button className="btn btn-sm btn-outline-secondary" onClick={toggleLang}>
              🌐 {lang === 'pl' ? 'Switch to English' : 'Zmień na Polski'}
            </button>
          </div>
        </div>
      </div>
    ),
    main: () => (
      <div className="row g-4 mt-2">
        <div className="col-md-7">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <ProgressButton 
                label={<><Icons.Hammer size={20} className="me-2" />Wydobądź ręcznie (+${gameData.current.clickPower})</>} 
                duration={800} 
                onFinish={() => { gameData.current.gold += gameData.current.clickPower; addLog("Złoto +"+gameData.current.clickPower); }} 
              />
              <hr />
              {Object.values(BUILDINGS).map(b => {
                const IconComponent = Icons[b.icon] || Icons.HelpCircle;
                const count = gameData.current.owned[b.id];
                const cost = getBuildingCost(b.id, count);
                if (count === 0 && displayGold < b.baseCost * 0.7) return null;

                return (
                  <div key={b.id} className="card mb-2 border-0 shadow-sm overflow-hidden">
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        
                        <div className="d-flex align-items-center">
                          {/* KONTENER IKONY + PASKA + MONET */}
                          <div className="position-relative me-3 d-flex align-items-center justify-content-center" 
                              style={{ width: '32px', height: '32px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                            <div className="text-primary">
                              <IconComponent size={20} />
                            </div>
                            
                            {/* Pasek i monety renderują się TYLKO jeśli mamy budynek */}
                            {count > 0 && (
                              <div style={{ position: 'absolute', bottom: '-2px', left: '4px', right: '4px' }}>
                                <BuildingProgressBar interval={1000} />
                              </div>
                            )}
                          </div>

                          <div className="d-flex flex-row align-items-start">
                            <div className="d-flex flex-column">
                              <span className="fw-bold small m-0">{t(`buildings.${b.id}.name`)}</span>
                              <span className="text-muted" style={{fontSize: '0.7rem'}}>
                                {t(`buildings.${b.id}.desc`)}
                              </span>
                            </div>
                            <span className="badge bg-light text-primary border ms-auto" 
                                  style={{ fontSize: '0.65rem', height: 'fit-content', width: 'fit-content' }}>
                              lvl {count}
                            </span>
                          </div>

                        </div>

                        <button 
                          className={`btn btn-sm py-1 px-2 ${displayGold >= cost ? 'btn-success' : 'btn-outline-danger'}`}
                          onClick={() => handleBuyBuilding(b.id)}
                          style={{ fontSize: '0.8rem' }}
                        >
                          Kup: {cost} 💰
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
        <div className="col-md-5"><Logger logs={logs} /></div>
      </div>
    ),
    upgrades: () => (
      <div className="card shadow-sm p-4 mt-2 border-0">
        <h5>Sklep z ulepszeniami</h5>
        <div className="row mt-3">
          {Object.values(UPGRADES).map(upg => {
            if (gameData.current.upgrades[upg.id] || displayGold < upg.cost * 0.5) return null;
            return (
              <div key={upg.id} className="col-md-6 mb-3">
                <div className="p-3 border rounded bg-light">
                  <h6>{upg.name}</h6>
                  <p className="small text-muted">{upg.description}</p>
                  <button className={`btn btn-sm w-100 ${displayGold >= upg.cost ? 'btn-warning' : 'btn-outline-secondary'}`}
                          disabled={displayGold < upg.cost} onClick={() => handleBuyUpgrade(upg.id)}>Kup ({upg.cost})</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    stats: () => (
      <div className="card shadow-sm p-4 text-center mt-2 border-0">
        <h5>Statystyki Imperium</h5>
        <div className="row mt-4">
          <div className="col-4 border-end"><h6>Złoto</h6><p className="h4 text-warning">{displayGold.toLocaleString()}</p></div>
          <div className="col-4 border-end"><h6>Prędkość</h6><p className="h4 text-info">{displayGPS.toFixed(1)}/s</p></div>
          <div className="col-4"><h6>Klik</h6><p className="h4 text-success">{gameData.current.clickPower}</p></div>
        </div>
        <button className="btn btn-secondary mt-4" onClick={() => setCurrentView('main')}>Powrót</button>
      </div>
    ),
    prestige: () => {
      const gain = calculatePrestigeGain(gameData.current.gold);
      return (
        <div className="card shadow-sm p-4 text-center border-0 bg-dark text-white">
          <h2 className="text-warning">Laboratorium Alchemii</h2>
          <p>Punkty Prestiżu: <strong>{gameData.current.prestigePoints}</strong></p>
          <p>Obecny bonus: <strong>+{(gameData.current.prestigePoints * 10)}%</strong></p>
          <hr className="bg-secondary" />
          <div className="py-4">
            <h5>Możliwy zysk: <span className="text-success">+{gain} pkt</span></h5>
            <p className="small text-muted">(Wymagane min. 1M złota, aby zyskać punkty)</p>
            <button 
              className="btn btn-warning btn-lg mt-2" 
              disabled={gain <= 0}
              onClick={handlePrestige}
            >
              Wykonaj Prestiż (Reset)
            </button>
          </div>
        </div>
      );
    },
    achievements: () => (
      <AchievementsList achievementData={gameData.current.achievementData} />
    )

  };

  return (
    <div className="container py-4">
      {/* Notyfikacja na górze */}
      <AchievementNotification 
        notifications={notifications} 
        onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} 
      />
      <nav className="navbar navbar-dark bg-dark rounded shadow-lg mb-4 px-3">
        <div className="d-flex align-items-center">
          <span className="h4 m-0 text-warning me-3">💰 {displayGold.toLocaleString()}</span>
          <span className="badge bg-info text-dark">⚡ {displayGPS.toFixed(1)}/s</span>
        </div>
        <div className="btn-group">
          <button className={`btn btn-sm ${currentView==='main'?'btn-light':'btn-outline-light'}`} onClick={() => setCurrentView('main')}>
            <Icons.LayoutDashboard size={16} className="me-1" /> {t('ui.main')}
          </button>
          <button className={`btn btn-sm ${currentView==='upgrades'?'btn-light':'btn-outline-light'}`} onClick={() => setCurrentView('upgrades')}>
            <Icons.TrendingUp size={16} className="me-1" /> {t('ui.upgrades')}
          </button>
          {/* Przycisk Prestiżu - pojawia się powyżej 500k złota */}
          {(gameData.current.gold > 500000 || gameData.current.prestigePoints > 0) && (
            <button className={`btn btn-sm ${currentView==='prestige'?'btn-warning text-dark':'btn-outline-warning'}`} onClick={() => setCurrentView('prestige')}>
              <Icons.Zap size={16} className="me-1"/> {t('ui.prestige')}
            </button>
          )}
          <button className={`btn btn-sm ${currentView==='achievements'?'btn-light':'btn-outline-light'}`} 
              onClick={() => setCurrentView('achievements')}>
            <Icons.Trophy size={16} className="me-1" /> {t('ui.achievements')}
          </button>
          <button className={`btn btn-sm ${currentView==='stats'?'btn-light':'btn-outline-light'}`} onClick={() => setCurrentView('stats')}>
            <Icons.BarChart3 size={16} className="me-1" /> {t('ui.stats')}
          </button>
          <button className="btn btn-sm btn-secondary ms-2" onClick={() => setCurrentView('menu')}>{t('ui.menu')}</button>
        </div>
      </nav>

      {VIEWS[currentView] ? VIEWS[currentView]() : VIEWS.menu()}
    </div>
  );
}

export default App;
