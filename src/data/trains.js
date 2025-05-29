export const trains = [
  {
    id: "12301",
    name: "Rajdhani Express",
    from: "Delhi",
    to: "Ahmedabad",
    departure: "16:55",
    arrival: "08:30",
    duration: "15h 35m",
    classes: ["1A", "2A", "3A"],
    fare: {
      "1A": 3500,
      "2A": 2100,
      "3A": 1200
    },
    days: ["Mon", "Wed", "Fri"],
    type: "Superfast"
  },
  {
    id: "12901",
    name: "Duronto Express",
    from: "Delhi",
    to: "Ahmedabad",
    departure: "23:00",
    arrival: "14:30",
    duration: "15h 30m",
    classes: ["1A", "2A", "3A", "SL"],
    fare: {
      "1A": 3200,
      "2A": 1900,
      "3A": 1100,
      "SL": 600
    },
    days: ["Tue", "Thu", "Sat"],
    type: "Superfast"
  },
  {
    id: "12957",
    name: "Swarna Jayanti Express",
    from: "Delhi",
    to: "Ahmedabad",
    departure: "19:40",
    arrival: "11:15",
    duration: "15h 35m",
    classes: ["1A", "2A", "3A", "SL"],
    fare: {
      "1A": 3100,
      "2A": 1800,
      "3A": 1050,
      "SL": 550
    },
    days: ["Mon", "Wed", "Fri", "Sun"],
    type: "Express"
  },
  {
    id: "12959",
    name: "Gujarat Express",
    from: "Delhi",
    to: "Ahmedabad",
    departure: "06:15",
    arrival: "23:45",
    duration: "17h 30m",
    classes: ["1A", "2A", "3A", "SL"],
    fare: {
      "1A": 2900,
      "2A": 1700,
      "3A": 1000,
      "SL": 500
    },
    days: ["Daily"],
    type: "Express"
  },
  {
    id: "12961",
    name: "August Kranti Express",
    from: "Delhi",
    to: "Ahmedabad",
    departure: "17:50",
    arrival: "09:25",
    duration: "15h 35m",
    classes: ["1A", "2A", "3A", "SL"],
    fare: {
      "1A": 2300,
      "2A": 1750,
      "3A": 1025,
      "SL": 525
    },
    days: ["Daily"],
    type: "Express"
  }
];

// Add more sample routes
export const additionalTrains = [
  {
    id: "12019",
    name: "Shatabdi Express",
    from: "Delhi",
    to: "Mumbai",
    departure: "06:10",
    arrival: "23:00",
    duration: "16h 50m",
    classes: ["1A", "2A", "3A"],
    fare: {
      "1A": 3800,
      "2A": 2250,
      "3A": 1300
    },
    days: ["Daily"],
    type: "Superfast"
  },
  {
    id: "12309",
    name: "Rajdhani Express",
    from: "Delhi",
    to: "Kolkata",
    departure: "16:55",
    arrival: "10:00",
    duration: "17h 5m",
    classes: ["1A", "2A", "3A"],
    fare: {
      "1A": 3600,
      "2A": 2150,
      "3A": 1250
    },
    days: ["Daily"],
    type: "Superfast"
  }
]; 