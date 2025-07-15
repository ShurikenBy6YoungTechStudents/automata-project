import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const OurTeam = () => {
    const navigate = useNavigate();
    
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-start mb-6">
                <button
                    onClick={handleBack}
                    className="bg-blue-950/95 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-950 transition-colors min-w-[120px] justify-center"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
            </div>
            
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>Our Team</h1>
                <p className='text-gray-600 text-lg'>Meet the talented individuals behind the project.</p>
            </div>
            
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                <div className='group'>
                    <a target='_blank' href="https://github.com/UmLyrithyreach">
                        <img
                            className='w-full h-auto rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105'
                            src="./40.jpg"
                            alt="Team Member"
                        />
                    </a>
                </div>
                <div className='group'>
                    <a target='_blank' href="https://github.com/SeaHuyty">
                        <img
                            className='w-full h-auto rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105'
                            src="./37.jpg"
                            alt="Team Member - Reach"
                        />
                    </a>
                </div>
                <div className='group'>
                    <a target='_blank' href="https://github.com/PhaySometh">
                        <img
                            className='w-full h-auto rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105'
                            src="./ahmeth.png"
                            alt="Team Member - Someth"
                        />
                    </a>
                </div>
                <div className='group'>
                    <a target='_blank' href="https://github.com/Sophavisnuka">
                        <img
                            className='w-full h-auto rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105'
                            src="./38.jpg"
                            alt="Team Member - Nuka"
                        />
                    </a>
                </div>
                <div className='group'>
                    <a target='_blank' href="https://github.com/Chhunhour72">
                        <img
                            className='w-full h-auto rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105'
                            src="./39.jpg"
                            alt="Team Member - Hour"
                        />
                    </a>
                </div>
                <div className='group'>
                    <a target='_blank' href="https://github.com/Ming-99s">
                        <img
                            className='w-full h-auto rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105'
                            src="./41.jpg"
                            alt="Team Member - Ming"
                        />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default OurTeam
