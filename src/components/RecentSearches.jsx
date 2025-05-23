import React from 'react';

function RecentSearches({ searches }) {
  return (
    <section className="bg-theme-secondary rounded-md shadow-md">
      <h3 className="bg-[var(--accent-color)] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        Recent Searches
      </h3>
      <ul className="p-4 space-y-4 text-xs sm:text-sm">
        {searches.length === 0 ? (
          <li className="text-theme-secondary italic">No recent searches yet.</li>
        ) : (
          searches.map(({ from, to, date }, i) => (
            <li key={i} className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-theme-secondary">
                <i className="far fa-clock text-xs"></i>
                <div>
                  <span className="text-theme-primary font-semibold">{from}</span>
                  <span> to </span>
                  <span className="font-semibold">{to}</span>
                  <div className="text-[10px] text-theme-secondary">{date}</div>
                </div>
              </div>
              <a href="#" className="text-[var(--accent-color)] hover:underline text-xs sm:text-sm">Search Again</a>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export default RecentSearches;