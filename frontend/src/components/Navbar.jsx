import React from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <div className='text-white bg-white-400 shadow-md p-5'>
            <div className='max-w-6xl px-6 mx-auto flex w-full justify-between items-center'>
                <Link to="/">
                    <img className='w-65 h-full' src="./CADT.png" alt="" />
                </Link>
                <Link to="/team">
                    <h1 className='bg-[#1a365d] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#153e75] transition-colors cursor-pointer'>Our Team</h1>
                </Link>
            </div>
        </div>
    )
}

export default Navbar