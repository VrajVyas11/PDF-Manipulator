import React from 'react'

function Loading() {
    return (
        <div className={`fixed -z-10 inset-0 transform md:translate-x-24 flex flex-col justify-center items-center bg-black/40 backdrop-blur-sm`}>
            <div className="w-12 h-12 mt-10 rounded-full animate-spin
                    border-8 border-solid border-blue-700 border-t-transparent shadow-md"></div>
            <span className="mt-6 text-white text-lg font-medium tracking-wide bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent animate-pulse">
                Loading...
            </span>
        </div>
    )
}

export default Loading