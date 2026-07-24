import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Diary } from "./pages/Diary";
import { NewDiaryEntry } from "./pages/NewDiaryEntry";
import { Flags } from "./pages/Flags";
import { NewFlagEntry } from "./pages/NewFlagEntry";
import { Timeline } from "./pages/Timeline";
import { GlowUp } from "./pages/GlowUp";
import { Streak } from "./pages/Streak";
import { CaseFile } from "./pages/CaseFile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="diary" element={<Diary />} />
          <Route path="diary/new" element={<NewDiaryEntry />} />
          <Route path="flags" element={<Flags />} />
          <Route path="flags/new" element={<NewFlagEntry />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="glow-up" element={<GlowUp />} />
          <Route path="streak" element={<Streak />} />
          <Route path="case-file" element={<CaseFile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
