const Logger = ({ logs }) => (
  <div className="card bg-dark text-light p-2 shadow-sm" style={{ minHeight: '200px' }}>
    <div className="small text-muted mb-2 border-bottom border-secondary text-uppercase" style={{fontSize: '0.7rem'}}>Dziennik</div>
    {logs.map((l, i) => (
      <div key={i} className={`small mb-1 ${i === 0 ? 'text-info fw-bold' : 'opacity-50'}`}>
        {i === 0 ? '> ' : ''}{l}
      </div>
    ))}
  </div>
);
export default Logger;
