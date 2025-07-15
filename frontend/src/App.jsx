import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FiniteAutomataList from './components/FiniteAutomataList';
import NewAutomata from './components/NewAutomata';
import EditAutomata from './components/EditAutomata';

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Router>
                <Routes>
                    <Route path="/" element={<FiniteAutomataList />} />
                    <Route path="/new" element={<NewAutomata />} />
                    <Route path="/edit/:id" element={<EditAutomata />} />
                </Routes>
            </Router>
        </div>
    );
}
