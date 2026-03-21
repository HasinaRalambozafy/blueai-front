import { useState, useEffect } from "react";
import './Dashboard.css';
import Plan from "./Plan.jsx";


const API_BASE = "http://127.0.0.1:5000";

function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts`);
      const data = await res.json();
      if (data.status === "success") setAlerts(data.alerts);
    } catch (err) {
      console.error("Erreur fetch alerts:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const latestAlert = alerts[0] || {};
  const pompeOn = alerts.some(alert => alert.value_at_alert >= 1.4);
  
  return (
    <div className="dashboard-layout">

      {/* --- TOP ROW: HG, HC1, HC2, HD --- */}
      <div className="top-widgets">
        <div className="card kpi-dark">
          <span className="card-label">Pompe</span>
          <div className="card-value">{pompeOn ? "ON" : "OFF"}</div>
          <p className="card-desc">Pompe en fonctionnement</p>
        </div>

        <div className="card kpi-blue">
          <span className="card-label">Capteur</span>
          <div className="card-value">{latestAlert.sensor_id || "Aucun"}</div>
          <p className="card-desc">Nom du capteur</p>
        </div>

        <div className="card kpi-white">
          <span className="card-label">Localisation</span>
          <div className="card-value">{latestAlert.location || "N/A"}</div>
          <p className="card-desc">Emplacement du capteur</p>
        </div>

        <div className={`card ${
  latestAlert.severity?.toLowerCase() === "critical" 
    ? "kpi-red" 
    : "kpi-white"
}`}>
          <span className="card-label">État Critique</span>
          <div className="card-value" style={{color: latestAlert.severity === "critical" ? "#ef4444" : "#fbbf24"}}>
            {latestAlert.severity ? latestAlert.severity.toUpperCase() : "Normal"}
          </div>
        </div>
      </div>

      {/* --- MIDDLE ROW: Carte réseau et Right Column --- */}
      <div className="middle-row">
        {/* Carte réseau */}
        <div className="map-view">
          <Plan alerte={ latestAlert.severity?.toLowerCase() || "normal"}/>
        </div>

        {/* Right column: D1 et D2 */}
        <div className="right-column">
          <div className="side-card">
            <h4>Message d'alerte</h4>
            <p>{latestAlert.message || "Aucune alerte"}</p>
          </div>
          <div className="side-card">
            <h4>Historique des alertes</h4>
            <ul className="log-list">
              {alerts.length === 0 && <li>Aucune alerte</li>}
              {alerts.map(alert => (
                <li key={alert.id}>
                  <span className="time">{new Date(alert.timestamp).toLocaleTimeString()}</span> - {alert.message} ({alert.value_at_alert})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;