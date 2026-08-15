import { NearbyMap } from "./NearbyMap";

function MapPanel({ stores = [], location = null, selectedStoreId = null, onSelectStore = null, compact = true }) {
  return (
    <NearbyMap
      stores={stores}
      location={location}
      selectedStoreId={selectedStoreId}
      onSelectStore={onSelectStore}
      compact={compact}
    />
  );
}

export default MapPanel;
