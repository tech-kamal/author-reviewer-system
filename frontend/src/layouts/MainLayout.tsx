import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}

export default MainLayout;