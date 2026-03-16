import * as Icons from 'lucide-react';
import { ACHIEVEMENTS } from "../data/achievements";

export default function AchievementsList({ achievementData }) {
  return (
    <div className="card shadow-sm p-4 mt-2 border-0">
      <h5>🏆 Osiągnięcia</h5>
      <div className="row mt-3">
        {Object.entries(ACHIEVEMENTS).map(([id, ach]) => {
          const IconComponent = Icons[ach.icon] || Icons.HelpCircle; // ← Fallback
          const achData = achievementData[id];
          const percentage = Math.min(100, (achData.progress / ach.progressMax) * 100);

          return (
            <div key={id} className="col-md-6 mb-3">
              <div className={`p-3 border rounded ${achData.unlocked ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                <div className="d-flex align-items-center">
                  <IconComponent size={32} className="me-2 text-primary" /> {/* ← Renderuj ikonę */}
                  <div className="flex-grow-1">
                    <h6 className="m-0">{ach.name}</h6>
                    <small className="text-muted">{ach.description}</small>
                    {!achData.unlocked && (
                      <div className="progress mt-1" style={{ height: '5px' }}>
                        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                      </div>
                    )}
                    {achData.unlocked && <small className="text-success">✓ Osiągnięte</small>}
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