/**
 * Displays a scrollable activity log panel showing the most recent game events.
 * The newest entry is highlighted; older entries are shown with reduced opacity.
 *
 * @param {Object} props
 * @param {string[]} props.logs - Array of log message strings (newest first)
 * @param {function(string, Object=): string} props.t - Translation helper function
 */
const Logger = ({ logs, t }) => (
  <div className="card bg-dark text-light p-2 shadow-sm" style={{ minHeight: '200px' }}>
    <div className="small text-muted mb-2 border-bottom border-secondary text-uppercase" style={{fontSize: '0.7rem'}}>{t('ui.log_title')}</div>
    {logs.map((l, i) => (
      <div key={i} className={`small mb-1 ${i === 0 ? 'text-info fw-bold' : 'opacity-50'}`}>
        {i === 0 ? '> ' : ''}{l}
      </div>
    ))}
  </div>
);
export default Logger;
