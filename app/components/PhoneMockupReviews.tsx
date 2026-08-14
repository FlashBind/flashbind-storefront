import React from 'react';

export default function PhoneMockupReviews() {
  return (
    <div className="w-[350px] h-[700px] border-[14px] border-gray-900 rounded-[3rem] shadow-2xl bg-white relative p-0 overflow-hidden flex-shrink-0 font-sans">
      <div className="w-full h-full bg-white overflow-y-auto rounded-none shadow-none pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* Fake Browser/Search Header */}
        <div className="px-4 pt-8 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3 shadow-sm">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <div className="flex-1 bg-gray-100 rounded-full h-10 px-4 flex items-center text-gray-700 text-sm">
            The Roastery Coffeehouse
          </div>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </div>

        {/* Cover Photos */}
        <div className="flex w-full h-40 bg-gray-200">
          <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400" className="w-2/3 h-full object-cover border-r border-white" alt="Cafe interior" />
          <div className="w-1/3 flex flex-col">
            <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=200" className="h-1/2 w-full object-cover border-b border-white" alt="Coffee" />
            <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200" className="h-1/2 w-full object-cover" alt="Pastries" />
          </div>
        </div>

        {/* Business Title & Meta */}
        <div className="px-4 mt-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">The Roastery Coffeehouse</h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-medium text-gray-900">4.8</span>
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">(124)</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Coffee shop · Open ⋅ Closes 5 PM</p>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mb-6 overflow-x-hidden">
            <button className="flex-1 bg-blue-600 text-white font-medium text-sm py-2 px-4 rounded-full flex flex-col items-center gap-1 justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Directions
            </button>
            <button className="flex-1 border border-gray-300 text-blue-600 font-medium text-sm py-2 px-4 rounded-full flex flex-col items-center gap-1 justify-center">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
               Save
            </button>
            <button className="flex-1 border border-gray-300 text-blue-600 font-medium text-sm py-2 px-4 rounded-full flex flex-col items-center gap-1 justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share
            </button>
          </div>
        </div>

        <div className="h-2 w-full bg-gray-100"></div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4 gap-6 text-sm font-medium text-gray-500 overflow-x-hidden">
          <div className="py-3">Overview</div>
          <div className="py-3 border-b-2 border-blue-600 text-blue-600">Reviews</div>
          <div className="py-3">Updates</div>
          <div className="py-3">Photos</div>
        </div>

        {/* Reviews Section */}
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Review summary</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-normal text-gray-900">4.8</span>
              <div className="flex text-yellow-400 mt-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <span className="text-xs text-gray-500 mt-1">124 reviews</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
               <div className="flex items-center gap-2"><span className="text-xs text-gray-500 w-2">5</span><div className="h-2 bg-yellow-400 rounded-full w-[80%]"></div></div>
               <div className="flex items-center gap-2"><span className="text-xs text-gray-500 w-2">4</span><div className="h-2 bg-yellow-400 rounded-full w-[15%]"></div></div>
               <div className="flex items-center gap-2"><span className="text-xs text-gray-500 w-2">3</span><div className="h-2 bg-yellow-400 rounded-full w-[3%]"></div></div>
               <div className="flex items-center gap-2"><span className="text-xs text-gray-500 w-2">2</span><div className="h-2 bg-gray-200 rounded-full w-0"></div></div>
               <div className="flex items-center gap-2"><span className="text-xs text-gray-500 w-2">1</span><div className="h-2 bg-yellow-400 rounded-full w-[2%]"></div></div>
            </div>
          </div>

          <button className="w-full py-2 px-4 bg-white border border-gray-300 text-blue-600 font-medium rounded-full flex justify-center items-center gap-2 shadow-sm mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Write a review
          </button>

          {/* Sample Review */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
              D
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">David Chen</div>
              <div className="text-xs text-gray-500 mb-1">Local Guide · 82 reviews</div>
              <div className="flex text-yellow-400 mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
                <span className="text-gray-500 text-xs ml-2">a day ago</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Absolutely the best coffee in town. The pastries are always fresh and the staff is incredibly friendly. I highly recommend tapping their tabletop stand to leave a review—it was so easy!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
