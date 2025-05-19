const { useState } = React;

// Navigation component with user actions and authentication
function Navbar() {
  return (
    <nav className="bg-[#1e2535] flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-3">
      <div className="flex items-center space-x-2">
        <i className="fas fa-train text-[#4a6cf7] text-lg"></i>
        <span className="font-semibold text-white text-sm sm:text-base">BookXpress</span>
      </div>
      <ul className="hidden md:flex space-x-8 text-xs sm:text-sm text-white/80 font-normal">
        <li><a href="#" className="hover:text-white">Home</a></li>
        <li><a href="#" className="hover:text-white">My Bookings</a></li>
        <li><a href="#" className="hover:text-white">Profile</a></li>
        <li><a href="#" className="hover:text-white">Support</a></li>
      </ul>
      <div className="flex items-center space-x-4 text-xs sm:text-sm">
        <button aria-label="Toggle dark mode" className="text-white/80 hover:text-white">
          <i className="fas fa-sun"></i>
        </button>
        <a href="#" className="text-white/80 hover:text-white">Login</a>
        <a href="#" className="bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded px-3 py-1 text-white text-xs sm:text-sm font-semibold">Register</a>
      </div>
    </nav>
  );
}

// Train search form with quota selection and validation
function Hero() {
  const [quota, setQuota] = useState("general");
  return (
    <section className="bg-[#3b63f7] px-4 sm:px-6 md:px-10 lg:px-16 py-10">
      <h2 className="text-white font-semibold text-center text-sm sm:text-lg md:text-xl mb-6">
        Find and Book Train Tickets
      </h2>
      <form className="max-w-5xl mx-auto bg-[#1e2535] rounded-md p-4 shadow-lg" onSubmit={e => e.preventDefault()}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label htmlFor="from" className="sr-only">From</label>
            <input
              id="from"
              type="text"
              placeholder="Enter city or station"
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
            />
          </div>
          <div>
            <label htmlFor="to" className="sr-only">To</label>
            <input
              id="to"
              type="text"
              placeholder="Enter city or station"
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
            />
          </div>
          <div>
            <label htmlFor="date" className="sr-only">Date</label>
            <input
              id="date"
              type="date"
              placeholder="mm/dd/yyyy"
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
            />
          </div>
          <div>
            <label htmlFor="class" className="sr-only">Class</label>
            <select
              id="class"
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
            >
              <option disabled selected>Select Class</option>
              <option>First Class</option>
              <option>Second Class</option>
              <option>Third Class</option>
            </select>
          </div>
        </div>
        <fieldset className="mb-4 text-xs sm:text-sm text-white/80 flex flex-wrap gap-4">
          <legend className="sr-only">Quotas</legend>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="general"
              checked={quota === "general"}
              onChange={() => setQuota("general")}
              className="accent-[#3b63f7]"
            />
            <span>General</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="ladies"
              checked={quota === "ladies"}
              onChange={() => setQuota("ladies")}
              className="accent-[#3b63f7]"
            />
            <span>Ladies</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="senior"
              checked={quota === "senior"}
              onChange={() => setQuota("senior")}
              className="accent-[#3b63f7]"
            />
            <span>Senior Citizen</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="tatkal"
              checked={quota === "tatkal"}
              onChange={() => setQuota("tatkal")}
              className="accent-[#3b63f7]"
            />
            <span>Tatkal</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="premium"
              checked={quota === "premium"}
              onChange={() => setQuota("premium")}
              className="accent-[#3b63f7]"
            />
            <span>Premium Tatkal</span>
          </label>
        </fieldset>
        <button
          type="submit"
          className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded py-2 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2"
        >
          <i className="fas fa-search"></i>
          <span>Search Trains</span>
        </button>
      </form>
    </section>
  );
}

// PNR status checker component with validation
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

// Recent search history component with dynamic data
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

// Popular train routes component with dynamic data
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

// Individual offer card component with dynamic data
function TrendingOffer({ title, desc, code }) {
  return (
    <div className="bg-[#1e2535] rounded-md p-4 shadow-md text-xs sm:text-sm">
      <h5 className="font-semibold text-white mb-1">{title}</h5>
      <p className="text-white/70 mb-2">{desc}</p>
      <div className="bg-[#2a3147] rounded px-2 py-1 w-max text-white/70 text-[10px] sm:text-xs flex items-center justify-between space-x-2">
        <span>{code}</span>
        <button className="bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded px-2 py-0.5 text-white text-[10px] sm:text-xs font-semibold">Apply</button>
      </div>
    </div>
  );
}

// Offers section component with dynamic data
function TrendingOffers() {
  const offers = [
    {
      title: "Weekend Special",
      desc: "Get 20% off on weekend bookings",
      code: "WEEKEND20"
    },
    {
      title: "Early Bird",
      desc: "Book 30 days in advance and save 15%",
      code: "EARLY15"
    },
    {
      title: "Group Booking",
      desc: "Special rates for groups of 4 or more",
      code: "GROUP10"
    }
  ];
  return (
    <section>
      <h3 className="text-white text-xs sm:text-sm font-semibold mb-4">Trending Offers</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {offers.map((offer, i) => (
          <TrendingOffer key={i} {...offer} />
        ))}
      </div>
    </section>
  );
}

// Footer component with navigation links
function Footer() {
  return (
    <footer className="bg-[#1e2535] text-white/80 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-white mb-4">About Us</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Company</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Safety</a></li>
              <li><a href="#" className="hover:text-white">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Cookies</a></li>
              <li><a href="#" className="hover:text-white">Licenses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Facebook</a></li>
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><a href="#" className="hover:text-white">Instagram</a></li>
              <li><a href="#" className="hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p>&copy; 2024 BookXpress. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Main application component
function App() {
  return (
    <div className="min-h-screen bg-[#161f2e]">
      <Navbar />
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PNRStatus />
          <RecentSearches />
          <PopularRoutes />
        </div>
        <TrendingOffers />
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);