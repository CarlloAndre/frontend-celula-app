import { Participant } from "../types";

interface RankingListProps {
  resto: Participant[];
  maxPuntos: number;
  offset: number; // para calcular la posición real (empiezan en el puesto 4)
}

const RankingList = ({ resto, maxPuntos, offset }: RankingListProps) => {
  if (resto.length === 0) return null;

  return (
    <div className="ranking-list">
      {resto.map((p, idx) => {
        const porcentaje = maxPuntos > 0 ? (p.puntosTotales / maxPuntos) * 100 : 0;
        return (
          <div className="ranking-row" key={p._id}>
            <span className="ranking-position">{idx + offset}</span>
            <div className="ranking-info">
              <div className="ranking-top">
                <span className="ranking-name">{p.nombre}</span>
                <span className="ranking-points">{p.puntosTotales} pts</span>
              </div>
              <div className="ranking-track">
                <div
                  className="ranking-fill"
                  style={{ width: `${Math.max(porcentaje, 3)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ranking-row {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 12px 16px;
        }
        .ranking-position {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink-soft);
          width: 26px;
          text-align: center;
          flex-shrink: 0;
        }
        .ranking-info {
          flex: 1;
          min-width: 0;
        }
        .ranking-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
          gap: 8px;
        }
        .ranking-name {
          font-weight: 600;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ranking-points {
        font-size: 13px;
        color: var(--color-ink);
        flex-shrink: 0;
        }
        .ranking-track {
          height: 6px;
          background: var(--color-bg-alt);
          border-radius: 4px;
          overflow: hidden;
        }
        .ranking-fill {
          height: 100%;
          background: var(--color-gold);
          border-radius: 4px;
          transition: width 0.4s ease;
        }
      `}</style>
    </div>
  );
};

export default RankingList;
