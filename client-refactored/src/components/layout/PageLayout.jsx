import Navbar from "./Navbar";
import Footer from "./Footer";
import Toast from "../common/Toast";
import AuthRequiredModal from "../common/AuthRequiredModal";
import CompareBar from "../ui/CompareBar";
import CompareDrawer from "../ui/CompareDrawer";
import { useUI } from "../../context/UIContext";

function PageLayout({ children }) {
  const { toast, closeToast, authModal, closeAuthModal } = useUI();

  return (
    <div className="app-shell">
      <Navbar />

      <Toast toast={toast} onClose={closeToast} />
      <AuthRequiredModal
        open={authModal.open}
        target={authModal.target}
        message={authModal.message}
        onClose={closeAuthModal}
      />

      <main>{children}</main>
      <CompareBar />
      <CompareDrawer />

      <Footer />
    </div>
  );
}

export default PageLayout;
