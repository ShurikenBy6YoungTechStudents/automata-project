import React from 'react'
import Navbar from './Navbar'

const OurTeam = () => {
    return (
        <div>
            <Navbar />
            <div className="max-w-6xl mx-auto p-6">
                <div className='text-center mb-8'>
                    <h1 className='text-2xl font-semibold text-gray-800'>Our Team</h1>
                    <p>Meet the talented individuals behind the project.</p>
                </div>
                <div className='w-full grid grid-cols-3 gap-10'>
                    <img className='transition ease-in-out hover:scale-107' src="./40.jpg" alt="" />
                    <img className='transition ease-in-out hover:scale-107' src="./37.jpg" alt="" />
                    <img className='transition ease-in-out hover:scale-107' src="./ahmeth.png" alt="" />
                    <a href="https://github.com/Sophavisnuka">
                        <img className='transition ease-in-out hover:scale-107' src="./38.jpg" alt="" />
                    </a>
                    <img className='transition ease-in-out hover:scale-107' src="./39.jpg" alt="" />
                    <img className='transition ease-in-out hover:scale-107' src="./41.jpg" alt="" />
                </div>
            </div>
        </div>
    )
}

export default OurTeam