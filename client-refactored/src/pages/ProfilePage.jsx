import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

function ProfilePage() {
  const { user } = useAuth();
  const { savedStores, recentSearches, compareStores } = useData();

  return (
    <section className="panel auth-panel">
      <div>
        <p className="eyebrow">Signed in</p>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
      </div>

      <div className="trust-list">
        <span>JWT session ready</span>
        <span>{savedStores.length} saved stores</span>
        <span>{compareStores.length} stores in comparison</span>
      </div>

      <div>
        <p className="eyebrow">Recent searches</p>
        <div className="profile-list">
          {recentSearches.length ? (
            recentSearches.map((term) => <span key={term}>{term}</span>)
          ) : (
            <span>No recent searches yet.</span>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
