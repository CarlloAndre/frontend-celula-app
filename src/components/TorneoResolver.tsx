import { useEffect } from "react";
import { useParams, Outlet, Link } from "react-router-dom";
import { useTorneo } from "../context/TorneoContext";

// Se coloca como layout de todas las rutas /torneo/:slug/*.
// Garantiza que, antes de renderizar Top / Semanas / Login / Admin, el
// contexto tenga cargado el torneo correspondiente al slug de la URL.
const TorneoResolver = () => {
  const { slug } = useParams<{ slug: string }>();
  const { torneo, loading, error, resolverPorSlug } = useTorneo();

  useEffect(() => {
    if (slug) resolverPorSlug(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!slug) {
    return (
      <div className="app-shell">
        <div className="card empty-state">
          <p>Falta indicar el torneo.</p>
          <Link to="/" className="btn btn-gold">
            Elegir un torneo
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="card empty-state">
          <p>{error}</p>
          <Link to="/" className="btn btn-gold">
            Elegir un torneo
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !torneo || torneo.slug !== slug) {
    return (
      <div className="app-shell">
        <p>Cargando torneo...</p>
      </div>
    );
  }

  return <Outlet />;
};

export default TorneoResolver;
