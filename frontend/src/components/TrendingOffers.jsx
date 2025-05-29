import React from "react";

function TrendingOffer({ offer, onApplyOffer }) {
  return (
    <div className="bg-theme-secondary rounded-md p-4 shadow-md text-xs sm:text-sm">
      <h5 className="font-semibold text-theme-primary mb-1">{offer.title}</h5>
      <p className="text-theme-secondary mb-2">{offer.desc}</p>
      <div className="bg-theme-primary rounded px-2 py-1 w-max text-theme-secondary text-[10px] sm:text-xs flex items-center justify-between space-x-2">
        <span>{offer.code}</span>
        <button 
          className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] transition rounded px-2 py-0.5 text-white text-[10px] sm:text-xs font-semibold"
          onClick={() => onApplyOffer(offer)}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

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