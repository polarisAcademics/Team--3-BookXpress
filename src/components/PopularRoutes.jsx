
function PopularRoutes() {
  const routes = [
    { from: "Delhi", to: "Mumbai", trains: 74 },
    { from: "Bangalore", to: "Chennai", trains: 18 },
    { from: "Kolkata", to: "Delhi", trains: 15 },
    { from: "Mumbai", to: "Ahmedabad", trains: 22 },
    { from: "Chennai", to: "Hyderabad", trains: 14 },
    { from: "Pune", to: "Mumbai", trains: 23 },
  ];
  return (
    <section className="bg-[#1e2535] rounded-md shadow-md">
      <h3 className="bg-[#3b63f7] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        Popular Routes
      </h3>
      <ul className="p-4 space-y-3 text-xs sm:text-sm">
        {routes.map(({ from, to, trains }, i) => (
          <li key={i} className="flex justify-between items-center text-white/80">
            <div className="flex items-center space-x-2">
              <i className="fas fa-map-marker-alt text-[10px]"></i>
              <div>
                <span className="text-white font-semibold">{from}</span>
                <span> to </span>
                <span className="font-semibold">{to}</span>
                <div className="text-[10px] text-white/50">{trains} trains available</div>
              </div>
            </div>
                            <a href="#" className="text-[#3b63f7] hover:underline text-xs sm:text-sm font-semibold">Book</a>
            </li>
        ))}
      </ul>
    </section>
  );
}

export default PopularRoutes;