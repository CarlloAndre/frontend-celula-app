import { Participant } from "../types";

interface PodiumProps {
  top3: Participant[];
}

const medalEmoji = ["🥇", "🥈", "🥉"];

const Podium = ({ top3 }: PodiumProps) => {
  // Reordenar visualmente: 2do - 1ro - 3ro (el ganador queda al centro y más alto)
  const ordenVisual = [top3[1], top3[0], top3[2]].filter(Boolean);
  const alturas = [top3[1] ? "180px" : "0", "220px", top3[2] ? "150px" : "0"];

  if (top3.length === 0) {
    return null;
  }

  return (
    <div className="podium">
      {ordenVisual.map((participant, idx) => {
        const posicionReal = top3.findIndex((p) => p._id === participant._id);
        return (
          <div className="podium-column" key={participant._id}>
            <div className="podium-name">{participant.nombre}</div>
            <div className="podium-points">{participant.puntosTotales} pts</div>
            <div
              className={`podium-bar podium-bar-${posicionReal + 1}`}
              style={{ height: alturas[idx] }}
            >
              <span className="podium-medal">{medalEmoji[posicionReal]}</span>
              <span className="podium-rank">{posicionReal + 1}</span>
            </div>
          </div>
        );
      })}

      <style>{`
        .podium {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 14px;
          margin: 28px 0 40px;
          padding: 0 8px;
        }
        .podium-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 160px;
        }
        .podium-name {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 2px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
        .podium-points {
          font-family: var(--font-display);
          font-size: 13px;
          color: var(--color-ink-soft);
          margin-bottom: 10px;
        }
        .podium-bar {
          width: 100%;
          border-radius: 10px 10px 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 14px;
          position: relative;
          transition: height 0.4s ease;
        }
        .podium-bar-1 {
          background: linear-gradient(180deg, var(--color-gold-soft), var(--color-gold));
        }
        .podium-bar-2 {
          background: linear-gradient(180deg, #d9d9d9, #b8b8b8);
        }
        .podium-bar-3 {
          background: linear-gradient(180deg, #e3b98a, #c9925a);
        }
        .podium-medal {
          font-size: 28px;
          line-height: 1;
        }
        .podium-rank {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: rgba(43, 36, 32, 0.55);
          margin-top: 4px;
        }
        @media (max-width: 480px) {
          .podium-name {
            font-size: 12px;
            max-width: 90px;
          }
        }
      `}</style>
    </div>
  );
};

export default Podium;
