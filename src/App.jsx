import React, { useState, useEffect, useRef } from 'react';
import { getNewGameState, getInitialOwned, getInitialUpgrades, getInitialAchievementData } from './data/gameData';
import { BUILDINGS } from "./data/buildings";
import { UPGRADES } from "./data/upgrades";
import { calculateCurrentGPS, getBuildingCost, calculatePrestigeGain } from './logic/gameLogic';
import ProgressButton from './components/ProgressButton';
import BuildingProgressBar from './components/BuildingProgressBar';
import Logger from './components/Logger';
import './App.css';
import * as Icons from 'lucide-react';
import { pl } from './locales/pl';
import { en } from './locales/en';
import { es } from './locales/es';
import { checkAchievements, applyAchievementReward } from './logic/gameLogic';
import AchievementsList from './components/AchievementsList';
import AchievementNotification from "./components/AchievementNotification";
import { ACHIEVEMENTS } from "./data/achievements";
import { DEV_MODE } from './config/devConfig';
import { 
  saveGameToStorage, 
  loadGameFromStorage, 
  listBackups, 
  restoreBackup 
} from './utils/saveManager';
import { 
  downloadSaveFile, 
  importSaveFile 
} from './utils/fileHandler';

const TRANSLATIONS = { pl, en, es };
const LANGS = ['pl', 'en', 'es'];

function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [logs, setLogs] = useState([pl.logs.system_active]);
  const [displayGold, setDisplayGold] = useState(0);
  const [displayGPS, setDisplayGPS] = useState(0);
  const [lang, setLang] = useState('pl');
  const [notifications, setNotifications] = useState([]);

  /**
   * Resolves a dot-separated translation key to a string in the active language,
   * then replaces `{{var}}` template placeholders with the provided values.
   * Falls back to the raw key string if the path does not exist in the translation map.
   *
   * @param {string} path - Dot-separated key path (e.g. 'ui.buy_cost')
   * @param {Object.<string, string|number>} [vars={}] - Template variables to substitute
   * @returns {string} Translated and interpolated string
   * @example
   * t('ui.buy_cost', { cost: 150 }); // "Buy (150)"
   * t('nonexistent.key');            // "nonexistent.key"
   */
  const t = (path, vars = {}) => {
    let str = path.split('.').reduce((obj, key) => obj?.[key], TRANSLATIONS[lang]) || path;
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v), str);
  };

  const gameData = useRef(getNewGameState());

  /**
   * Prepends a message to the activity log and keeps only the 5 most recent entries.
   *
   * @param {string} m - Log message to display
   */
  const addLog = (m) => setLogs(p => [m, ...p].slice(0, 5));

  /**
   * Displays a toast notification for a newly unlocked achievement.
   * The notification is automatically removed after 5 seconds.
   *
   * @param {string} achievementId - ID of the achievement that was unlocked
   * @example
   * showAchievementNotification('firstGold');
   */
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
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== achievementId));
    }, 5000);
  };

  // --- GAME TICK, OFFLINE & SAVE LOGIC ---
  useEffect(() => {
    // Load game state on mount
    try {
      const saved = loadGameFromStorage();
      if (saved) {
        const now = Date.now();
        const secondsAway = Math.floor((now - (saved.lastUpdate || now)) / 1000);

        // Merge loaded state with fresh data structures
        const freshOwned = getInitialOwned();
        const freshUpgrades = getInitialUpgrades();
        const freshAchievements = getInitialAchievementData();
        
        gameData.current = {
          ...saved,
          owned: { ...freshOwned, ...saved.owned },
          upgrades: { ...freshUpgrades, ...saved.upgrades },
          achievementData: { ...freshAchievements, ...saved.achievementData },
          lastUpdate: now
        };

        // Handle offline earnings
        if (secondsAway > 10) {
          const gps = calculateCurrentGPS(gameData.current);
          const earned = Math.floor(gps * secondsAway);
          if (earned > 0) {
            gameData.current.gold += earned;
            addLog(t('ui.offline_msg', { time: Math.floor(secondsAway / 60), earned: earned.toLocaleString() }));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load save:', error);
      addLog(t('logs.save_corrupted'));
      // Continue with fresh game state
    }

    // Main game tick - update every 50ms
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

    // Achievement check interval - every 1000ms
    const achievementCheckInterval = setInterval(() => {
      const newAchievements = checkAchievements(gameData.current);
      newAchievements.forEach(achId => {
        applyAchievementReward(gameData.current, achId);
        showAchievementNotification(achId);
      });
    }, 1000);

    // Auto-save to localStorage - every 5000ms
    const saveInt = setInterval(() => {
      try {
        saveGameToStorage(gameData.current);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 5000);

    return () => { 
      clearInterval(interval); 
      clearInterval(achievementCheckInterval);
      clearInterval(saveInt);
    };
  }, []);

  // --- PURCHASE ACTIONS ---
  /**
   * Attempts to purchase one unit of the specified building using the current gold.
   * Deducts the cost, increments the owned count, logs the transaction, and checks
   * whether any achievements were newly unlocked as a result.
   *
   * @param {string} id - Building identifier (key in BUILDINGS)
   */
  const handleBuyBuilding = (id) => {
    const cost = getBuildingCost(id, gameData.current.owned[id]);
    if (gameData.current.gold >= cost) {
      gameData.current.gold -= cost;
      gameData.current.owned[id] += 1;
      addLog(t('logs.buy_building', { name: t(`buildings.${id}.name`) }));

      const newAchievements = checkAchievements(gameData.current);
      newAchievements.forEach(achId => {
        applyAchievementReward(gameData.current, achId);
        showAchievementNotification(achId);
      });
    }
  };

  /**
   * Attempts to purchase the specified upgrade using the current gold.
   * Each upgrade can only be purchased once. Applying a 'click' upgrade immediately
   * increases clickPower; a 'global' upgrade increases the globalMultiplier.
   * Checks for newly unlocked achievements after each successful purchase.
   *
   * @param {string} id - Upgrade identifier (key in UPGRADES)
   */
  const handleBuyUpgrade = (id) => {
    const upg = UPGRADES[id];
    if (gameData.current.gold >= upg.cost && !gameData.current.upgrades[id]) {
      gameData.current.gold -= upg.cost;
      gameData.current.upgrades[id] = true;
      if (upg.type === 'click') gameData.current.clickPower *= upg.multiplier;
      if (upg.type === 'global') gameData.current.globalMultiplier *= upg.multiplier;
      addLog(t('logs.buy_upgrade', { name: t(`upgrades.${id}.name`) }));

      const newAchievements = checkAchievements(gameData.current);
      newAchievements.forEach(achId => {
        applyAchievementReward(gameData.current, achId);
        showAchievementNotification(achId);
      });
    }
  };

  /**
   * Executes the prestige reset flow:
   * 1. Calculates how many prestige points would be gained; aborts if zero.
   * 2. Prompts the user for confirmation showing the gain and bonus preview.
   * 3. On confirmation: resets all progress to a fresh game state while carrying
   *    over accumulated prestige points and applying the prestige multiplier
   *    (each prestige point grants +10% to all production).
   * 4. Immediately persists the new state to localStorage.
   */
  const handlePrestige = () => {
    const gain = calculatePrestigeGain(gameData.current.gold);
    
    // Validate that a prestige reset would actually yield points
    if (gain <= 0) {
      addLog(t('logs.prestige_low'));
      return;
    }

    // Show a confirmation dialog with the potential gain and resulting bonus
    const confirmMsg = t('prestige.confirm', { gain, percent: gain * 10 });

    if (window.confirm(confirmMsg)) {
      const totalPoints = (gameData.current.prestigePoints || 0) + gain;
      
      // Build a clean new game state, then overlay prestige-persistent values
      const newState = getNewGameState(); 
      
      gameData.current = {
        ...newState,
        prestigePoints: totalPoints,
        prestigeMultiplier: 1 + (totalPoints * 0.1), // Each point grants +10% production
        lastUpdate: Date.now()
      };

      // Reset the log and notify the player about the new era
      setLogs([
        t('logs.era_started', { n: totalPoints }),
        t('logs.prestige_multiplier', { val: gameData.current.prestigeMultiplier.toFixed(1) }),
        ...logs
      ].slice(0, 5));
      setCurrentView('main');
      
      // Persist immediately so progress is not lost on a page reload
      localStorage.setItem('idleGameSave', JSON.stringify(gameData.current));
    }
  };

  // --- VIEW DEFINITIONS ---
  const VIEWS = {
    menu: () => (
      <div className="text-center py-5 bg-light rounded shadow-sm border mt-4">
        <h1 className="display-4">Idle Core Engine</h1>
        <div className="d-grid gap-2 col-md-4 mx-auto mt-4">
          <button className="btn btn-primary btn-lg shadow" onClick={() => setCurrentView('main')}>
            {displayGold > 0 ? t('ui.continue') : t('ui.new_game')}
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => { localStorage.clear(); window.location.reload(); }}>{t('ui.reset')}</button>
          <div className="mt-4 border-top pt-3">
            <div className="btn-group" role="group" aria-label="Language selector">
              {LANGS.map(l => (
                <button
                  key={l}
                  className={`btn btn-sm ${lang === l ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setLang(l)}
                >
                  {TRANSLATIONS[l].ui.lang_name}
                </button>
              ))}
            </div>
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
                label={<><Icons.Hammer size={20} className="me-2" />{t('ui.click_label', { power: gameData.current.clickPower })}</>} 
                duration={800} 
                onFinish={() => { gameData.current.gold += gameData.current.clickPower; addLog(t('ui.gold_plus', { power: gameData.current.clickPower })); }} 
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
                          {/* Icon container with progress bar overlay */}
                          <div className="position-relative me-3 d-flex align-items-center justify-content-center" 
                              style={{ width: '32px', height: '32px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                            <div className="text-primary">
                              <IconComponent size={20} />
                            </div>
                            
                            {/* Progress bar and coins are rendered only when the building is owned */}
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
                          {t('ui.buy_cost', { cost })}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
        <div className="col-md-5"><Logger logs={logs} t={t} /></div>
      </div>
    ),
    upgrades: () => (
      <div className="card shadow-sm p-4 mt-2 border-0">
        <h5>{t('upgrades_shop.title')}</h5>
        <div className="row mt-3">
          {Object.values(UPGRADES).map(upg => {
            if (gameData.current.upgrades[upg.id] || displayGold < upg.cost * 0.5) return null;
            return (
              <div key={upg.id} className="col-md-6 mb-3">
                <div className="p-3 border rounded bg-light">
                  <h6>{t(`upgrades.${upg.id}.name`)}</h6>
                  <p className="small text-muted">{t(`upgrades.${upg.id}.desc`)}</p>
                  <button className={`btn btn-sm w-100 ${displayGold >= upg.cost ? 'btn-warning' : 'btn-outline-secondary'}`}
                          disabled={displayGold < upg.cost} onClick={() => handleBuyUpgrade(upg.id)}>{t('ui.upgrade_buy_btn', { cost: upg.cost })}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    stats: () => (
      <div className="card shadow-sm p-4 text-center mt-2 border-0">
        <h5>{t('stats.title')}</h5>
        <div className="row mt-4">
          <div className="col-4 border-end"><h6>{t('stats.gold')}</h6><p className="h4 text-warning">{displayGold.toLocaleString()}</p></div>
          <div className="col-4 border-end"><h6>{t('stats.speed')}</h6><p className="h4 text-info">{displayGPS.toFixed(1)}/s</p></div>
          <div className="col-4"><h6>{t('stats.click')}</h6><p className="h4 text-success">{gameData.current.clickPower}</p></div>
        </div>
        <button className="btn btn-secondary mt-4" onClick={() => setCurrentView('main')}>{t('stats.back')}</button>
      </div>
    ),
    prestige: () => {
      const gain = calculatePrestigeGain(gameData.current.gold);
      return (
        <div className="card shadow-sm p-4 text-center border-0 bg-dark text-white">
          <h2 className="text-warning">{t('prestige.title')}</h2>
          <p>{t('prestige.points')}: <strong>{gameData.current.prestigePoints}</strong></p>
          <p>{t('prestige.bonus')}: <strong>+{(gameData.current.prestigePoints * 10)}%</strong></p>
          <hr className="bg-secondary" />
          <div className="py-4">
            <h5>{t('prestige.possible_gain')}: <span className="text-success">+{gain} {t('prestige.pts')}</span></h5>
            <p className="small text-muted">{t('prestige.requirement')}</p>
            <button 
              className="btn btn-warning btn-lg mt-2" 
              disabled={gain <= 0}
              onClick={handlePrestige}
            >
              {t('prestige.execute')}
            </button>
          </div>
        </div>
      );
    },
    achievements: () => (
      <AchievementsList achievementData={gameData.current.achievementData} t={t} />
    ),
    saveManager: () => (
      <div className="card shadow-sm p-4 mt-2 border-0">
        <h5>{t('save_manager.title')}</h5>
        
        {DEV_MODE && (
          <div className="alert alert-warning mb-4">
            {t('save_manager.dev_mode_warning')}
          </div>
        )}
        
        {/* EXPORT SECTION */}
        <div className="mb-4">
          <h6>{t('save_manager.export_section')}</h6>
          <button 
            className="btn btn-primary w-100"
            onClick={() => {
              try {
                downloadSaveFile(gameData.current);
                addLog(t('logs.export_ready'));
              } catch (error) {
                addLog(t('logs.import_failed', { error: error.message }));
              }
            }}
          >
            📥 {t('save_manager.download_file')}
          </button>
        </div>
        
        {/* IMPORT SECTION */}
        <div className="mb-4">
          <h6>{t('save_manager.import_section')}</h6>
          <input 
            type="file" 
            className="form-control"
            accept=".dat,.json"
            onChange={async (e) => {
              if (!e.target.files[0]) return;
              
              try {
                const imported = await importSaveFile(e.target.files[0]);
                gameData.current = { ...gameData.current, ...imported };
                saveGameToStorage(gameData.current);
                addLog(t('logs.save_imported'));
                e.target.value = ''; // Clear input
              } catch (error) {
                addLog(t('logs.import_failed', { error: error.message }));
              }
            }}
          />
        </div>
        
        {/* BACKUPS SECTION */}
        <div className="mb-4">
          <h6>{t('save_manager.backups_section')}</h6>
          <div className="d-flex flex-wrap gap-2">
            {listBackups().length === 0 ? (
              <p className="text-muted small">{t('save_manager.no_backups')}</p>
            ) : (
              listBackups().map((backup) => (
                <button 
                  key={backup.index}
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    // Ask for confirmation before restoring
                    const confirmMsg = t('save_manager.confirm_restore', { date: backup.dateStr });
                    
                    if (window.confirm(confirmMsg)) {
                      try {
                        const restored = restoreBackup(backup.index);
                        gameData.current = { ...gameData.current, ...restored };
                        addLog(t('logs.backup_restored'));
                        // Visual feedback - toast or badge
                        const notif = {
                          id: `backup-${Date.now()}`,
                          name: t('save_manager.backup_restored_title'),
                          icon: 'CheckCircle',
                          reward: null,
                          timestamp: Date.now()
                        };
                        setNotifications(prev => [...prev, notif]);
                        setTimeout(() => {
                          setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        }, 3000);
                      } catch (error) {
                        addLog(t('logs.import_failed', { error: error.message }));
                      }
                    }
                  }}
                >
                  {backup.dateStr}
                </button>
              ))
            )}
          </div>
        </div>

      </div>
    ),

  };

  return (
    <div className="container py-4">
      {/* Notyfikacja na górze */}
      <AchievementNotification 
        notifications={notifications} 
        onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} 
        t={t}
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
          {/* Prestige button — visible only above 500k gold or when prestige has been used */}
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
          <button className={`btn btn-sm ${currentView==='saveManager'?'btn-light':'btn-outline-light'}`} onClick={() => setCurrentView('saveManager')}>
            <Icons.Save size={16} className="me-1" /> {t('ui.save_manager')}
          </button>
          <button className="btn btn-sm btn-secondary ms-2" onClick={() => setCurrentView('menu')}>{t('ui.menu')}</button>
        </div>
      </nav>

      {VIEWS[currentView] ? VIEWS[currentView]() : VIEWS.menu()}
    </div>
  );
}

export default App;
