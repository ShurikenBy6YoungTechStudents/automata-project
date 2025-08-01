import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

import { Search, Plus } from 'lucide-react';
import Navbar from './Navbar';
export default function FiniteAutomataList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [automataList, setAutomataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAutomata();
    }, []);

    const fetchAutomata = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/automata");
            if (response.data.success) {
                setAutomataList(response.data.automata);
            }
        } catch (err) {
            console.error("Error fetching automata:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleAddNew = () => {
        navigate('/new');
    };

    const handleAutomatonClick = (id) => {
        navigate(`/edit/${id}`);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this automaton?')) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/automaton/${id}`);
                if (response.data.success) {
                    fetchAutomata();
                }
            } catch (err) {
                console.error("Error deleting automaton:", err);
                alert("Failed to delete automaton");
            }
        }
    };

    const filteredAutomata = automataList.filter(automaton =>
        automaton.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <Navbar />
            <div className="max-w-6xl mx-auto p-6">
                {/* Header with Title and Add Button */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Finite Automata
                    </h1>
                    <button
                        onClick={handleAddNew}
                        className="bg-[#1a365d] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#153e75] transition-colors"
                    >
                        <Plus size={20} />
                        ADD
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="search by title"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                        />
                </div>

                {/* Automata List */}
                <div className="min-h-[400px] bg-white rounded-lg shadow p-4">
                    {automataList.length === 0 ? (
                        <div className="flex justify-center items-center h-[400px] text-gray-500">
                            No Finite Automata
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {automataList.map((automata, index) => (
                                <div 
                                    key={index}
                                    className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow"
                                    >
                                    <h1 className="font-medium text-start text-[25px] mb-5">{automata.name}</h1>
                                    <h3 className="font-medium text-start">Created At: <span className="font-normal">{automata.created_at}</span></h3>
                                    <h3 className="font-medium text-start">Updated At: <span className="font-normal">{automata.updated_at}</span></h3>
                                    <button onClick={() => navigate(`/edit/${automata.id}`)} className="flex justify-start mt-7 px-5 py-3 rounded-lg bg-[#1a365d] text-white cursor-pointer hover:bg-[#153e75] transition-colors cursor-pointer">Click To Edit</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
