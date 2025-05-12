
import React from 'react';

function PNRStatus() {
  return (
    <section className="bg-[#1e2535] rounded-md shadow-md">
      <h3 className="bg-[#3b63f7] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        PNR Status
      </h3>
      <form className="p-4 space-y-3" onSubmit={e => e.preventDefault()}>
        <label htmlFor="pnr" className="block text-xs sm:text-sm text-white/80 mb-1">Enter PNR Number</label>
        <input
          id="pnr"
          type="text"
          placeholder="10-digit PNR number"
          className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
        />
        <button
          type="submit"
          className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded py-2 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2"
        >
          <i className="fas fa-search"></i>
          <span>Check Status</span>
        </button>
      </form>
    </section>
  );
}

export default PNRStatus;