import React from 'react';
import { useNavigate } from 'react-router-dom';

// Display list of available trains with fare details and booking options
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
        console.log('TrainList rendering train fare details:', {
            trainId: train.id,
            trainFare: JSON.stringify(train.fare),
            selectedClass: selectedClass,
            appliedDiscount: JSON.stringify(appliedDiscount),
            quota: quota
        });
        return (
        <div key={train.id} className="bg-[#1e2535] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">{train.name}</h3>
              <p className="text-[#7a8bbf] text-sm">Train #{train.id}</p>
            </div>
            <span className="bg-[#3b63f7] text-white text-xs px-2 py-1 rounded">
              {train.type}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-white font-semibold">{train.departure}</p>
              <p className="text-[#7a8bbf] text-sm">{train.from}</p>
            </div>
            <div className="text-center">
              <p className="text-[#7a8bbf] text-sm">{train.duration}</p>
              <div className="h-0.5 bg-[#3b63f7] my-2"></div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{train.arrival}</p>
              <p className="text-[#7a8bbf] text-sm">{train.to}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {train.classes.map((cls) => (
                <span 
                  key={cls}
                  className={`text-xs px-2 py-1 rounded ${
                    selectedClass === cls 
                      ? 'bg-[#3b63f7] text-white' 
                      : 'bg-[#2a3147] text-[#7a8bbf]'
                  }`}
                >
                  {cls}
                </span>
              ))}
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">
                {appliedDiscount ? (
                  <>
                    <span className="line-through text-[#7a8bbf] text-sm mr-2">
                      ₹{train.fare[selectedClass] || train.fare['3A']}
                    </span>
                    ₹{
                      appliedDiscount.code === 'SENIOR10' && quota !== 'senior'
                        ? train.fare[selectedClass] || train.fare['3A']
                        : appliedDiscount.type === 'percent'
                          ? Math.round((train.fare[selectedClass] || train.fare['3A']) * (1 - appliedDiscount.value / 100))
                          : Math.max(0, (train.fare[selectedClass] || train.fare['3A']) - appliedDiscount.value)
                    }
                  </>
                ) : (
                  `₹${train.fare[selectedClass] || train.fare['3A']}`
                )}
              </p>
              <p className="text-[#7a8bbf] text-sm">Starting Fare</p>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-2">
              {train.days.map((day) => (
                <span 
                  key={day}
                  className="text-[#7a8bbf] text-xs bg-[#2a3147] px-2 py-1 rounded"
                >
                  {day}
                </span>
              ))}
            </div>
            <button 
              onClick={() => onBookNow(train)}
              className="bg-[#3b63f7] hover:bg-[#2f54e0] text-white px-4 py-2 rounded text-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      )})}
    </div>
  );
}

export default TrainList; 