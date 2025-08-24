import React, { useState, useMemo, useEffect } from 'react';
import { Info, User, Weight, Ruler, Percent } from 'lucide-react';

// --- Helper Components ---

// Reusable slider component for inputs
const InputSlider = ({ icon, label, unit, value, onChange, min, max, step }) => (
  <div className="w-full">
    <label className="flex justify-between items-center text-slate-300 font-medium mb-2">
      <span>{label}</span>
      <span className="text-lg font-bold text-cyan-400">{value} {unit}</span>
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        {icon}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg slider-thumb"
      />
    </div>
  </div>
);

// --- Main Application Component ---
export default function App() {
  // --- State Management ---
  const [height, setHeight] = useState(175); // in cm
  const [weight, setWeight] = useState(70); // in kg
  const [bodyFat, setBodyFat] = useState(15); // in %
  const [gender, setGender] = useState('male');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // --- FFMI Calculation Logic ---
  const ffmiData = useMemo(() => {
    if (height === 0) return { ffmi: 0, adjustedFfmi: 0, fatFreeMass: 0, category: 'N/A', interpretation: '' };

    const heightInMeters = height / 100;
    const fatMass = weight * (bodyFat / 100);
    const fatFreeMass = weight - fatMass;

    if (fatFreeMass <= 0) return { ffmi: 0, adjustedFfmi: 0, fatFreeMass: 0, category: 'N/A', interpretation: '' };

    const ffmi = fatFreeMass / (heightInMeters * heightInMeters);
    const adjustedFfmi = ffmi + 6.1 * (1.8 - heightInMeters);

    let category = '';
    let interpretation = '';
    let ffmiRanges;

    if (gender === 'male') {
      ffmiRanges = {
        belowAverage: 18,
        average: 20,
        aboveAverage: 22,
        excellent: 24,
        suspicious: 25,
      };
      if (ffmi < ffmiRanges.belowAverage) {
        category = 'Below Average';
        interpretation = 'Indicates a lower level of muscle mass for your height.';
      } else if (ffmi < ffmiRanges.average) {
        category = 'Average';
        interpretation = 'A healthy and typical amount of muscle mass.';
      } else if (ffmi < ffmiRanges.aboveAverage) {
        category = 'Above Average';
        interpretation = 'Represents a good level of muscular development.';
      } else if (ffmi < ffmiRanges.excellent) {
        category = 'Excellent';
        interpretation = 'Signifies a high degree of muscularity, often seen in athletes.';
      } else if (ffmi < ffmiRanges.suspicious) {
        category = 'Very Muscular';
        interpretation = 'Indicates a level of muscle mass that is achievable naturally by very few.';
      } else {
        category = 'Likely Unnatural';
        interpretation = 'This level of muscularity is rarely, if ever, achieved without performance-enhancing drugs.';
      }
    } else { // female
      ffmiRanges = {
        belowAverage: 14,
        average: 16,
        aboveAverage: 18,
        excellent: 20,
        suspicious: 21,
      };
      if (ffmi < ffmiRanges.belowAverage) {
        category = 'Below Average';
        interpretation = 'Indicates a lower level of muscle mass for your height.';
      } else if (ffmi < ffmiRanges.average) {
        category = 'Average';
        interpretation = 'A healthy and typical amount of muscle mass.';
      } else if (ffmi < ffmiRanges.aboveAverage) {
        category = 'Above Average';
        interpretation = 'Represents a good level of muscular development.';
      } else if (ffmi < ffmiRanges.excellent) {
        category = 'Excellent';
        interpretation = 'Signifies a high degree of muscularity, often seen in athletes.';
      } else {
        category = 'Very Muscular';
        interpretation = 'Indicates a level of muscle mass that is very high and rarely achieved naturally.';
      }
    }

    return {
      ffmi: ffmi.toFixed(2),
      adjustedFfmi: adjustedFfmi.toFixed(2),
      fatFreeMass: fatFreeMass.toFixed(2),
      category,
      interpretation,
      ranges: ffmiRanges,
    };
  }, [height, weight, bodyFat, gender]);

  // --- Gauge Calculation ---
  const gaugePercentage = useMemo(() => {
    const { ffmi, ranges } = ffmiData;
    if (!ranges) return 0;

    const min = gender === 'male' ? 16 : 13;
    const max = gender === 'male' ? 26 : 22;
    const percentage = ((ffmi - min) / (max - min)) * 100;

    return Math.max(0, Math.min(100, percentage));
  }, [ffmiData, gender]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                if (confirm('New version available! Would you like to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch(error => console.log('Service worker registration failed:', error));
    }
  }, []);

  return (
    <>
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #22d3ee; /* cyan-400 */
          cursor: pointer;
          border-radius: 50%;
          margin-top: -4px;
          transition: background .2s;
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #22d3ee; /* cyan-400 */
          cursor: pointer;
          border-radius: 50%;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          background: #67e8f9; /* cyan-300 */
        }
        .slider-thumb::-moz-range-thumb:hover {
          background: #67e8f9; /* cyan-300 */
        }
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
      <div className="min-h-screen w-full bg-slate-900 font-sans text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
        <div className="w-full max-w-md mx-auto">
          {/* --- Header --- */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              FFMI Calculator
            </h1>
            <p className="text-slate-400 mt-2">Calculate your Fat-Free Mass Index.</p>
          </header>

          {/* --- Main Content --- */}
          <main className="space-y-6">
            {/* --- Input Section --- */}
            <div className="bg-slate-800/50 p-6 rounded-2xl backdrop-blur-sm border border-slate-700 space-y-6">
              {/* Gender Toggle */}
              <div>
                <label className="text-slate-300 font-medium mb-2 flex items-center">
                  <User size={20} className="mr-2 text-slate-400" />
                  Biological Gender
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    aria-pressed={gender === 'male'}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${gender === 'male' ? 'bg-cyan-500 text-slate-900' : 'bg-transparent text-slate-300 hover:bg-slate-600 hover:text-white'}`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    aria-pressed={gender === 'female'}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${gender === 'female' ? 'bg-cyan-500 text-slate-900' : 'bg-transparent text-slate-300 hover:bg-slate-600 hover:text-white'}`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <InputSlider
                icon={<Ruler size={20} />}
                label="Height"
                unit="cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="130"
                max="230"
                step="1"
              />
              <InputSlider
                icon={<Weight size={20} />}
                label="Weight"
                unit="kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="30"
                max="200"
                step="0.5"
              />
              <InputSlider
                icon={<Percent size={20} />}
                label="Body Fat"
                unit="%"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                min="3"
                max="50"
                step="0.1"
              />
            </div>

            {/* --- Result Section --- */}
            <div className="bg-gradient-to-br from-purple-600/30 to-cyan-600/30 p-6 rounded-2xl backdrop-blur-sm border border-slate-700 text-center transition-all duration-500 ease-in-out">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-slate-200">Your Results</h2>
                <button onClick={() => setIsInfoModalOpen(true)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  <Info size={20} />
                </button>
              </div>

              {/* Gauge */}
              <div className="relative w-48 h-24 mx-auto mb-4">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 * (1 - gaugePercentage / 100)}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                  />
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  <span className="text-4xl font-bold text-white">{ffmiData.ffmi}</span>
                  <span className="text-sm text-slate-400 ml-1">FFMI</span>
                </div>
              </div>

              <p className="text-lg font-semibold text-cyan-400 mb-2">{ffmiData.category}</p>
              <p className="text-sm text-slate-300 max-w-xs mx-auto mb-6">{ffmiData.interpretation}</p>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-800/50 p-3 rounded-lg">
                <div>
                  <p className="text-slate-400">Adjusted FFMI</p>
                  <p className="font-semibold text-slate-100 text-base">{ffmiData.adjustedFfmi}</p>
                </div>
                <div>
                  <p className="text-slate-400">Fat-Free Mass</p>
                  <p className="font-semibold text-slate-100 text-base">{ffmiData.fatFreeMass} kg</p>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* --- Info Modal --- */}
        {isInfoModalOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsInfoModalOpen(false)}
          >
            <div
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-slate-300 space-y-4 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-cyan-400">About FFMI</h3>
              <p className="text-sm">The Fat-Free Mass Index (FFMI) is a measurement that relates your muscle mass to your height. It's a more accurate indicator of muscularity than BMI because it accounts for body fat percentage.</p>
              <p className="text-sm"><strong className="text-slate-100">Calculation:</strong> It's calculated by dividing your fat-free mass (in kg) by the square of your height (in meters).</p>
              <p className="text-sm"><strong className="text-slate-100">Adjusted FFMI:</strong> This version normalizes the score for individuals who are taller or shorter than average (1.8m or 5'11"), providing a more comparable metric.</p>
              <p className="text-sm">The index is useful for tracking muscle gain or loss over time and assessing one's level of muscular development.</p>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="w-full bg-cyan-500 text-slate-900 font-bold py-2 px-4 rounded-lg mt-4 hover:bg-cyan-400 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
