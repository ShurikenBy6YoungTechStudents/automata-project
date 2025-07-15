import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FiniteAutomataList from './components/FiniteAutomataList';
import NewAutomata from './components/NewAutomata';
import EditAutomata from './components/EditAutomata';
import OurTeam from './components/OurTeam';

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Router>
                <Routes>
                    <Route path="/" element={<FiniteAutomataList />} />
                    <Route path="/new" element={<NewAutomata />} />
                    <Route path="/edit/:id" element={<EditAutomata />} />
                    <Route path="/team" element={<OurTeam />} />
                </Routes>
            </Router>
        </div>
    );
}
