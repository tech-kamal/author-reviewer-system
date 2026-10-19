import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export default function WorkspaceLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">

      {/* =====================================================
          COMMON NAVBAR
          ===================================================== */}

      <Navbar />


      {/* =====================================================
          WORKSPACE CONTENT
          ===================================================== */}

      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>


      {/* =====================================================
          COMMON FOOTER
          ===================================================== */}

      <Footer />

    </div>
  );
}