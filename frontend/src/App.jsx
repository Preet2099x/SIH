import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BusList from "./BusList";
import BusDetail from "./BusDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BusList />} />
        <Route path="/bus/:id" element={<BusDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
