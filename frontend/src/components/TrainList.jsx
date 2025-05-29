import React from 'react';
import { useNavigate } from 'react-router-dom';

function TrainList({ trains, selectedClass, appliedDiscount, quota, onBookNow }) {
  const navigate = useNavigate();

  const handleBookNow = (train) => {
    navigate('/book-tickets', {
      state: {
        selectedTrain: train,
        selectedClass: selectedClass,
        appliedDiscount: appliedDiscount
      }
    });
  };

  if (!trains || trains.length === 0) {
    return (
      <div className="text-white text-center py-8">
        No trains found for this route
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trains.map((train) => {
        // Ensure train object has all required properties with fallbacks
        const trainData = {
          id: train.trainNumber || train.id,
          name: train.trainName || train.name,
          from: train.fromStation?.name || train.from,
          to: train.toStation?.name || train.to,
          departure: train.fromStation?.departure || train.departure,
          arrival: train.toStation?.arrival || train.arrival,
          duration: train.duration,
          classes: train.availableClasses || train.classes || ['1A', '2A', '3A', 'SL'],
          fare: train.fare || {
            '1A': 1500,
            '2A': 800,
            '3A': 500,
            'SL': 250
          },
          days: train.runningDays || train.days || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
          type: train.trainType || train.type || 'Express'
        };

        return (
          <div key={trainData.id} className="bg-theme-secondary rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-theme-primary font-semibold text-lg">{trainData.name}</h3>
                <p className="text-theme-secondary text-sm">Train #{trainData.id}</p>
              </div>
              <span className="bg-[var(--accent-color)] text-white text-xs px-2 py-1 rounded">
                {trainData.type}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-theme-primary font-semibold">{trainData.departure}</p>
                <p className="text-theme-secondary text-sm">{trainData.from}</p>
              </div>
              <div className="text-center">
                <p className="text-theme-secondary text-sm">{trainData.duration}</p>
                <div className="h-0.5 bg-[var(--accent-color)] my-2"></div>
              </div>
              <div className="text-right">
                <p className="text-theme-primary font-semibold">{trainData.arrival}</p>
                <p className="text-theme-secondary text-sm">{trainData.to}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {trainData.classes.map((cls) => (
                  <span 
                    key={cls}
                    className={`text-xs px-2 py-1 rounded ${
                      selectedClass === cls 
                        ? 'bg-[var(--accent-color)] text-white' 
                        : 'bg-theme-primary text-theme-secondary border border-theme'
                    }`}
                  >
                    {cls}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-theme-primary font-semibold">
                  {appliedDiscount ? (
                    <>
                      <span className="line-through text-theme-secondary text-sm mr-2">
                        ₹{trainData.fare[selectedClass] || trainData.fare['3A']}
                      </span>
                      ₹{
                        appliedDiscount.code === 'SENIOR10' && quota !== 'senior'
                          ? trainData.fare[selectedClass] || trainData.fare['3A']
                          : appliedDiscount.type === 'percent'
                            ? Math.round((trainData.fare[selectedClass] || trainData.fare['3A']) * (1 - appliedDiscount.value / 100))
                            : Math.max(0, (trainData.fare[selectedClass] || trainData.fare['3A']) - appliedDiscount.value)
                      }
                    </>
                  ) : (
                    `₹${trainData.fare[selectedClass] || trainData.fare['3A']}`
                  )}
                </p>
                <p className="text-theme-secondary text-sm">Starting Fare</p>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-2">
                {trainData.days.map((day) => (
                  <span 
                    key={day}
                    className="text-theme-secondary text-xs bg-theme-primary border border-theme px-2 py-1 rounded"
                  >
                    {day}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => onBookNow(trainData)}
                className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded text-sm"
              >
                Book Now
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TrainList; 