import { useState } from "react";
import FarmScene from "./FarmScene";

const demoPlots = [
  { id: "DEMO-A1", crop: "Tomato", area: "0.8 ha", status: "Monitoring recommended", detail: "No linked diagnosis; demonstration plot only." },
  { id: "DEMO-B2", crop: "Corn", area: "1.2 ha", status: "Healthy observations", detail: "No linked diagnosis; demonstration plot only." },
  { id: "DEMO-C3", crop: "Apple", area: "0.6 ha", status: "No observations", detail: "No linked diagnosis; demonstration plot only." },
];

export default function FarmExplorer(): JSX.Element {
  const [selectedId, setSelectedId] = useState(demoPlots[0].id);
  const selected = demoPlots.find((plot) => plot.id === selectedId) || demoPlots[0];

  return (
    <section className="page-grid">
      <div className="section-head">
        <div>
          <p className="eyebrow">Digital Twin</p>
          <h2>3D Farm Explorer</h2>
          <p className="muted">Explore an interactive demonstration field. Register a farm to replace this view with your own boundaries and observations.</p>
        </div>
        <span className="demo-badge">DEMO DATA</span>
      </div>

      <div className="farm-explorer-grid">
        <div className="card farm-explorer-scene">
          <FarmScene />
        </div>
        <div className="card">
          <p className="eyebrow">Selected plot</p>
          <h3>{selected.id}</h3>
          <div className="plot-detail-list">
            <div><span>Crop</span><strong>{selected.crop}</strong></div>
            <div><span>Area</span><strong>{selected.area}</strong></div>
            <div><span>Status</span><strong>{selected.status}</strong></div>
          </div>
          <p className="muted" style={{ marginTop: "16px" }}>{selected.detail}</p>
          <p className="source-note">This demonstration geometry is not a registered farm and does not contribute to production statistics.</p>
        </div>
      </div>

      <div className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Plot registry</p>
            <h3>Demonstration plots</h3>
          </div>
          <span className="muted">{demoPlots.length} demo plots</span>
        </div>
        <div className="plot-selector-grid">
          {demoPlots.map((plot) => (
            <button
              type="button"
              key={plot.id}
              className={`plot-selector ${selectedId === plot.id ? "active" : ""}`}
              onClick={() => setSelectedId(plot.id)}
            >
              <strong>{plot.id}</strong>
              <span>{plot.crop} · {plot.area}</span>
              <small>{plot.status}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
