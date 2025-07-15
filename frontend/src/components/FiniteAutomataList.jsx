import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

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
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Finite Automata</h1>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Add New Automata
                </button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search automata..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="min-h-[400px] bg-white rounded-lg shadow p-4">
                {loading ? (
                    <div className="flex justify-center items-center h-[400px] text-gray-500">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            Loading automata...
                        </div>
                    </div>
                ) : filteredAutomata.length === 0 ? (
                    <div className="flex justify-center items-center h-[400px] text-gray-500">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🤖</div>
                            <h3 className="text-xl font-medium mb-2">
                                {searchQuery ? 'No matching automata found' : 'No Finite Automata'}
                            </h3>
                            <p className="text-gray-400 mb-4">
                                {searchQuery ? 'Try adjusting your search terms' : 'Create your first automaton to get started'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={handleAddNew}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Automaton
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAutomata.map((automaton) => (
                            <div 
                                key={automaton.id}
                                onClick={() => handleAutomatonClick(automaton.id)}
                                className="relative p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-gray-50 group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {automaton.name}
                                    </h3>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAutomatonClick(automaton.id);
                                            }}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(automaton.id, e)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>
                                        <span className="font-medium">Created:</span> {' '}
                                        {new Date(automaton.created_at).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <span className="font-medium">Updated:</span> {' '}
                                        {new Date(automaton.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        Click to edit
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
