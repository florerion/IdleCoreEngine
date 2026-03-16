import React from 'react';
import * as Icons from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';

export default function AchievementNotification({ notifications, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
      {notifications.map(notif => {
        const IconComponent = Icons[ACHIEVEMENTS[notif.id].icon] || Icons.Award;
        return (
          <div key={notif.id} className="alert alert-success alert-dismissible fade show" role="alert" style={{ marginBottom: '10px', minWidth: '300px' }}>
            <div className="d-flex align-items-center">
              <IconComponent size={24} className="me-2" />
              <div className="flex-grow-1">
                <strong>{notif.name}</strong>
                {notif.reward?.multiplier && <br />}
                {notif.reward?.multiplier && <small>+{((notif.reward.multiplier - 1) * 100).toFixed(0)}% do produkcji</small>}
                {notif.reward?.gold && <small>+{notif.reward.gold} 💰</small>}
              </div>
              <button type="button" className="btn-close" onClick={() => onRemove(notif.id)}></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}