import React from 'react'
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    
    return (
        <div className='bg-white shadow-md p-5'>
            <div className='max-w-6xl px-6 mx-auto flex w-full justify-between items-center'>
                <div className='flex items-center'>
                    <Link to="/" className='hover:opacity-80 transition-opacity'>
                        <img className='h-8 w-auto' src="/CADT.png" alt="CADT Logo" />
                    </Link>
                </div>
                
                <div className='flex items-center gap-4'>
                    <Link 
                        to="/"
                        className={`px-4 py-2 rounded-md transition-colors font-medium ${
                            location.pathname === '/' 
                                ? 'bg-[#1a365d] text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Home
                    </Link>
                    <Link 
                        to="/team"
                        className={`px-4 py-2 rounded-md transition-colors font-medium ${
                            location.pathname === '/team' 
                                ? 'bg-[#1a365d] text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Our Team
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Navbar
