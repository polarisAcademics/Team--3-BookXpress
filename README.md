
# BookXpress - Train Booking UI

BookXpress is a modern, clean, and responsive train booking platform designed to provide an optimal user experience. It features a minimalistic design with smooth navigation, a search interface for train availability, and a seamless booking process. The app supports theme toggling, mobile responsiveness, and real-time updates for seat availability.

## 🚀 Features

* Clean, minimalistic header with logo and navigation menu
* Prominent search container with auto-suggestions and date picker
* Real-time train results display with seat availability, fare details, and filter options
* Multi-step booking process with progress indicators
* Mobile-responsive design
* Auto-save and form validation
* PNR status checker and support chat widget
* Real-time seat availability updates
* Quick links to recent searches and popular routes

## 🛠 Tech Stack

* *Frontend*: HTML, CSS, JavaScript (ES6+)
* *Frameworks/Libraries*:

  * React.js for component-based UI
  * Material UI for responsive components
  * React Router for navigation
  * Styled-components for CSS-in-JS styling
* *Theme Toggle*: CSS media queries for light/dark mode support
* *API Integration*: Placeholder APIs for train search and booking functionality (mock data for now)
* *Form Validation*: React Hook Form + Yup for validation
* *State Management*: React Context API (for global state)
* *Real-time updates*: WebSocket (for seat availability updates)


## 🛠 Setup & Installation

### Prerequisites

Make sure you have the following installed:

* *Node.js* (LTS version)
* *npm* (or Yarn)

### Steps to Set Up

1. *Clone the repository*:

   bash
   git clone https://github.com/yourusername/bookxpress.git
   cd bookxpress
   

2. *Install dependencies*:

   If you are using *npm*:

   bash
   npm install
   

   Or if you prefer *Yarn*:

   bash
   yarn install
   

3. *Run the development server*:

   For npm:

   bash
   npm start
   

   For Yarn:

   bash
   yarn start
   

   This will start the app at [http://localhost:3000](http://localhost:3000).

4. Open the app in your browser and start using it!

## 💻 Usage

### Navigating the App

* *Home Page*: Includes the search form where users can input station details, dates, and class information to search for available trains.
* *Train Results*: Displays a list of available trains based on the search parameters. Filters allow narrowing down options by price, time, and class.
* *Booking Process*: A multi-step form guides the user through entering passenger details, selecting a seat, reviewing the booking, and making a payment.

### Theme Toggle

The app supports both light and dark modes. Users can toggle between modes using the button in the top right corner of the header.

### Authentication

* *Login/Register* buttons are displayed when the user is not logged in.
* The user can log in or register via a mock authentication service.

### Booking Progress

During the booking process, the multi-step form displays a progress indicator. The form includes auto-save functionality, and user input is saved as they move through the steps.

### Real-Time Updates

* The app displays real-time seat availability with color coding.
* Seat selection is updated dynamically, showing available, unavailable, or reserved status.

### Support Chat

A support chat bubble is available in the bottom-right corner for instant assistance.

## 🎨 Customization

You can customize the app by editing the following:

* *Theme*: Modify src/styles/theme.css for light/dark mode styles.
* *API Integration*: Update src/services/api.js to integrate with real APIs for real train search and booking data.
* *Branding*: Update the logo and colors in the src/assets directory.

