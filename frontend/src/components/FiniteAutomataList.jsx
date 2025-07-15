import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import Navbar from './Navbar';
export default function FiniteAutomataList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [automataList, _setAutomataList] = useState([]);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleAddNew = () => {
        navigate('/new');
    };

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
                                    <h3 className="font-medium">{automata.title}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}