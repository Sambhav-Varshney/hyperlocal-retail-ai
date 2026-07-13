import Navbar from "./Navbar";
import Footer from "./Footer";
import Toast from "../common/Toast";
import AuthRequiredModal from "../common/AuthRequiredModal";
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

      <Footer />
    </div>
  );
}

export default PageLayout;
