import React from 'react';
import * as Icons from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';

/**
 * Renders a stack of dismissible toast notifications for newly unlocked achievements.
 * Positioned fixed in the top-right corner of the viewport.
 *
 * @param {Object} props
 * @param {Array<{id: string, name: string, icon: string, reward: Object, timestamp: number}>} props.notifications
 *   Active notifications to display
 * @param {function(string): void} props.onRemove - Callback invoked with the notification ID when dismissed
 * @param {function(string, Object=): string} props.t - Translation helper function
 */
export default function AchievementNotification({ notifications, onRemove, t }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
      {notifications.map(notif => {
        const IconComponent = Icons[ACHIEVEMENTS[notif.id].icon] || Icons.Award;
        return (
          <div key={notif.id} className="alert alert-success alert-dismissible fade show" role="alert" style={{ marginBottom: '10px', minWidth: '300px' }}>
            <div className="d-flex align-items-center">
              <IconComponent size={24} className="me-2" />
              <div className="flex-grow-1">
                <strong>{t(`achievements.${notif.id}.name`)}</strong>
                {notif.reward?.multiplier && <br />}
                {notif.reward?.multiplier && <small>{t('achievements_page.production_bonus', { pct: ((notif.reward.multiplier - 1) * 100).toFixed(0) })}</small>}
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