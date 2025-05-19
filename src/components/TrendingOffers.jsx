import React from "react";

// Individual offer card component with apply button
function TrendingOffer({ offer, onApplyOffer }) {
  return (
    <div className="bg-[#1e2535] rounded-md p-4 shadow-md text-xs sm:text-sm">
      <h5 className="font-semibold text-white mb-1">{offer.title}</h5>
      <p className="text-white/70 mb-2">{offer.desc}</p>
      <div className="bg-[#2a3147] rounded px-2 py-1 w-max text-white/70 text-[10px] sm:text-xs flex items-center justify-between space-x-2">
        <span>{offer.code}</span>
        <button 
          className="bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded px-2 py-0.5 text-white text-[10px] sm:text-xs font-semibold"
          onClick={() => onApplyOffer(offer)}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// Display grid of promotional offers with discount codes
function TrendingOffers({ onApplyOffer }) {
  const offers = [
    { 
      title: "Weekend Getaway", 
      desc: "20% off on all weekend bookings", 
      code: "WEEKEND20", 
      discount: { type: 'percent', value: 20, code: 'WEEKEND20' } 
    },
    { 
      title: "First Journey", 
      desc: "Flat ₹100 off on your first booking", 
      code: "FIRST100", 
      discount: { type: 'flat', value: 100, code: 'FIRST100' } 
    },
    { 
      title: "Senior Citizen", 
      desc: "Additional 10% off for senior citizens", 
      code: "SENIOR10", 
      discount: { type: 'percent', value: 10, code: 'SENIOR10' } 
    },
  ];
  return (
    <section>
      <h4 className="flex items-center space-x-2 text-white font-semibold text-sm sm:text-base mb-4">
        <i className="fas fa-chart-line text-[#3b63f7]"></i>
        <span>Trending Offers</span>
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer, i) => (
          <TrendingOffer 
            key={i} 
            offer={offer}
            onApplyOffer={onApplyOffer}
          />
        ))}
      </div>
    </section>
  );
}

export default TrendingOffers;