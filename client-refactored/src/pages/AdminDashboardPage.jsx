import { useData } from "../context/DataContext";
import { API_BASE_URL } from "../services/api";
import Metrics from "../components/ui/Metrics";

function AdminDashboardPage() {
  const { users, searchLogs, categories, stores } = useData();

  return (
    <div className="results-column">
      <Metrics stores={stores} categories={categories} users={users} searchLogs={searchLogs} />

      <section className="two-column">
        <div className="panel">
          <p className="eyebrow">Admin dashboard</p>
          <h2>System overview</h2>
          <div className="profile-list">
            <span>API: {API_BASE_URL}</span>
            <span>Total users: {users.length}</span>
            <span>Total logged searches: {searchLogs.length}</span>
          </div>
        </div>
        <div className="panel table-panel">
          <p className="eyebrow">Latest search logs</p>
          <table>
            <thead>
              <tr>
                <th>Keyword</th>
                <th>City</th>
                <th>Results</th>
              </tr>
            </thead>
            <tbody>
              {searchLogs.slice(0, 8).map((log) => (
                <tr key={log.id}>
                  <td>{log.keyword}</td>
                  <td>{log.city || "-"}</td>
                  <td>{log.resultsFound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
