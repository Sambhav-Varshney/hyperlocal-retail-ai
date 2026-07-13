import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Metrics from "../components/ui/Metrics";
import MapPanel from "../components/ui/MapPanel";
import RecommendationPanel from "../components/ui/RecommendationPanel";

function DashboardPage() {
  const { user } = useAuth();
  const {
    categories,
    users,
    searchLogs,
    filteredStores,
    location,
    savedStores,
    compareStores,
    loading,
  } = useData();

  return (
    <div className="results-column">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Welcome back, {user?.name || "there"}.</h1>
          </div>
          <Link className="primary-action" to="/search">
            Go to search
          </Link>
        </div>
        {loading ? <span className="loading-chip">Refreshing data…</span> : null}
      </section>

      <Metrics stores={filteredStores} categories={categories} users={users} searchLogs={searchLogs} />

      <div className="two-column">
        <div className="panel profile-list">
          <p className="eyebrow">Your activity</p>
          <span>{savedStores.length} stores saved</span>
          <span>{compareStores.length} stores in comparison</span>
          <div className="card-actions">
            <Link className="ghost-action" to="/saved">
              View saved
            </Link>
            <Link className="ghost-action" to="/compare">
              View comparison
            </Link>
          </div>
        </div>
        <RecommendationPanel stores={filteredStores} />
      </div>

      <MapPanel stores={filteredStores} location={location} />
    </div>
  );
}

export default DashboardPage;
