import * as Icons from 'lucide-react';
import { ACHIEVEMENTS } from "../data/achievements";

/**
 * Displays a grid of all achievements with their icon, name, description,
 * unlock status, and a progress bar for locked achievements.
 *
 * @param {Object} props
 * @param {Object.<string, import('../data/gameData').AchievementState>} props.achievementData
 *   Runtime achievement state keyed by achievement ID
 * @param {function(string, Object=): string} props.t - Translation helper function
 */
export default function AchievementsList({ achievementData, t }) {
  return (
    <div className="card shadow-sm p-4 mt-2 border-0">
      <h5>{t('achievements_page.title')}</h5>
      <div className="row mt-3">
        {Object.entries(ACHIEVEMENTS).map(([id, ach]) => {
          const IconComponent = Icons[ach.icon] || Icons.HelpCircle; // Fallback icon for unknown names
          const achData = achievementData[id];
          const percentage = Math.min(100, (achData.progress / ach.progressMax) * 100);

          return (
            <div key={id} className="col-md-6 mb-3">
              <div className={`p-3 border rounded ${achData.unlocked ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                <div className="d-flex align-items-center">
                  <IconComponent size={32} className="me-2 text-primary" />
                  <div className="flex-grow-1">
                    <h6 className="m-0">{t(`achievements.${id}.name`)}</h6>
                    <small className="text-muted">{t(`achievements.${id}.desc`)}</small>
                    {!achData.unlocked && (
                      <div className="progress mt-1" style={{ height: '5px' }}>
                        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                      </div>
                    )}
                    {achData.unlocked && <small className="text-success">{t('achievements_page.unlocked')}</small>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}