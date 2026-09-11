import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Sidebar } from "./Sidebar";
import { HistoryNav } from "./HistoryNav";
import { AmbientBackground } from "../atmosphere/AmbientBackground";
import { CursorGlow } from "../atmosphere/CursorGlow";
import { ClickSpark } from "../atmosphere/ClickSpark";
import { useParallaxPointer } from "../../hooks/useParallaxPointer";
import "./AppLayout.css";

export function AppLayout() {
  const location = useLocation();
  useParallaxPointer();

  return (
    <div className="app-layout">
      <AmbientBackground />
      <CursorGlow />
      <ClickSpark />
      <Sidebar />
      <HistoryNav />
      <main className="app-layout__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
