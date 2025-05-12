
import React from 'react';

function RecentSearches() {
  const searches = [
    { from: "Delhi", to: "Jaipur", date: "17 Aug" },
    { from: "Mumbai", to: "Pune", date: "15 Aug" },
    { from: "Bangalore", to: "Mysore", date: "20 Aug" },
  ];
  return (
    <section className="bg-[#1e2535] rounded-md shadow-md">
      <h3 className="bg-[#3b63f7] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        Recent Searches
      </h3>
      <ul className="p-4 space-y-4 text-xs sm:text-sm">
        {searches.map(({ from, to, date }, i) => (
          <li key={i} className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white/80">
              <i className="far fa-clock text-xs"></i>
              <div>
                <span className="text-white font-semibold">{from}</span>
                <span> to </span>
                <span className="font-semibold">{to}</span>
                <div className="text-[10px] text-white/50">{date}</div>
              </div>
            </div>
            <a href="#" className="text-[#3b63f7] hover:underline text-xs sm:text-sm">Search Again</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentSearches;