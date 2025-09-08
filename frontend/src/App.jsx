import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import BusList from "./BusList";
import BusDetail from "./BusDetail";
import RoutesPage from "./Routes";
import AboutUs from "./AboutUs";
import Contact from "./Contact";
import TrackBus from "./TrackBus";
import ManageTicket from "./ManageTicket";
import "./HomePage.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/buses" element={<BusList />} />
        <Route path="/bus/:id" element={<BusDetail />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/track-bus" element={<TrackBus />} />
        <Route path="/manage-ticket" element={<ManageTicket />} />
      </Routes>
    </Router>
  );
}

export default App;
