"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface CityWeather {
  city: string;
  country: string;
  temperature: number;
  weather: string;
  icon: string;
  humidity: number;
  wind: number;
  time: string;
  isDay: boolean;
}

const MOCK_DATA: CityWeather[] = [
  { city: "Paris", country: "France", temperature: 18, weather: "Partly Cloudy", icon: "\u26c5", humidity: 62, wind: 14, time: "14:30", isDay: true },
  { city: "Tokyo", country: "Japan", temperature: 24, weather: "Sunny", icon: "\u2600\ufe0f", humidity: 55, wind: 8, time: "22:30", isDay: false },
  { city: "New York", country: "USA", temperature: 21, weather: "Clear", icon: "\u2600\ufe0f", humidity: 48, wind: 18, time: "08:30", isDay: true },
  { city: "Sydney", country: "Australia", temperature: 27, weather: "Sunny", icon: "\u2600\ufe0f", humidity: 60, wind: 12, time: "23:30", isDay: false },
  { city: "London", country: "UK", temperature: 14, weather: "Rainy", icon: "\ud83c\udf27\ufe0f", humidity: 80, wind: 20, time: "13:30", isDay: true },
  { city: "Dubai", country: "UAE", temperature: 38, weather: "Hot & Sunny", icon: "\ud83d\udd25", humidity: 25, wind: 6, time: "17:30", isDay: true },
  { city: "Moscow", country: "Russia", temperature: 3, weather: "Snowy", icon: "\u2744\ufe0f", humidity: 78, wind: 22, time: "16:30", isDay: true },
  { city: "Rio", country: "Brazil", temperature: 32, weather: "Tropical", icon: "\ud83c\udf34", humidity: 72, wind: 10, time: "10:30", isDay: true },
  { city: "Seoul", country: "South Korea", temperature: 20, weather: "Clear", icon: "\ud83c\udf24\ufe0f", humidity: 50, wind: 9, time: "22:30", isDay: false },
  { city: "Cape Town", country: "South Africa", temperature: 22, weather: "Windy", icon: "\ud83c\udf2c\ufe0f", humidity: 58, wind: 28, time: "15:30", isDay: true },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function WeatherPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CityWeather>(MOCK_DATA[0]);
  const [saved, setSaved] = useState<CityWeather[]>([
    MOCK_DATA[1],
    MOCK_DATA[2],
    MOCK_DATA[3],
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const suggestions =
    query.length > 0
      ? MOCK_DATA.filter((c) =>
          c.city.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  const isSaved = saved.some((c) => c.city === selected.city);

  function toggleSave() {
    if (isSaved) {
      setSaved((prev) => prev.filter((c) => c.city !== selected.city));
    } else {
      setSaved((prev) => [...prev, selected]);
    }
  }

  function selectCity(city: CityWeather) {
    setSelected(city);
    setQuery("");
    setShowSuggestions(false);
  }

  function removeSaved(cityName: string) {
    setSaved((prev) => prev.filter((c) => c.city !== cityName));
  }

  if (!mounted) return null;

  return (
    <motion.div
      className="min-h-screen px-4 py-12 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-10 text-center">
        <SectionLabel className="mb-3">UTILITY</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
          Weather App
        </h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Check current weather conditions across the globe. Save your favorite
          locations for quick access.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-10">
        <div className="flex gap-2">
          <Input
            placeholder="Search a city..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (query.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            className="flex-1"
          />
          <Button
            variant="gold"
            onClick={() => {
              if (suggestions.length > 0) {
                selectCity(suggestions[0]);
              }
            }}
          >
            Search
          </Button>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 z-50 mt-1"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <VoidPanel hoverable={false} className="p-1">
                {suggestions.map((city) => (
                  <motion.button
                    key={city.city}
                    className="w-full text-left px-4 py-2.5 rounded-md flex items-center justify-between
                      text-text-primary text-sm transition-colors hover:bg-gold/10 hover:text-gold cursor-pointer"
                    onClick={() => selectCity(city)}
                    whileHover={{ x: 4 }}
                  >
                    <span>
                      {city.icon} {city.city}, {city.country}
                    </span>
                    <span className="text-text-secondary text-xs">
                      {city.temperature}&deg;C
                    </span>
                  </motion.button>
                ))}
              </VoidPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current weather card */}
        <motion.div
          className="lg:col-span-2"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <VoidPanel
            hoverable={false}
            className={`relative overflow-hidden p-0 ${
              selected.isDay
                ? "bg-gradient-to-br from-void-deep/80 to-void/90"
                : "bg-gradient-to-br from-[#0a0a14] to-void-deep"
            }`}
          >
            {/* Gold accent top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-gold/60 via-gold to-gold/60" />

            <div className="p-8">
              {/* City header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display text-2xl text-text-primary">
                    {selected.city}
                  </h3>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest font-display text-gold/80 border border-gold/20 rounded-sm bg-gold/5">
                    {selected.country}
                  </span>
                  <p className="text-text-secondary text-xs mt-2">
                    Local time: {selected.time}
                  </p>
                </div>
                <button
                  onClick={toggleSave}
                  className="text-2xl transition-transform hover:scale-110 cursor-pointer"
                  title={isSaved ? "Remove from saved" : "Save location"}
                >
                  {isSaved ? (
                    <span className="text-gold drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]">
                      &#9733;
                    </span>
                  ) : (
                    <span className="text-text-secondary hover:text-gold">
                      &#9734;
                    </span>
                  )}
                </button>
              </div>

              {/* Temperature + icon */}
              <div className="flex items-center gap-6 mb-8">
                <span className="text-7xl">{selected.icon}</span>
                <div>
                  <p
                    className="text-6xl font-bold text-gold"
                    style={{
                      textShadow:
                        "0 0 20px rgba(212,175,55,0.3), 0 0 40px rgba(212,175,55,0.15)",
                    }}
                  >
                    {selected.temperature}&deg;C
                  </p>
                  <p className="text-text-secondary text-sm mt-1">
                    {selected.weather}
                  </p>
                </div>
              </div>

              {/* Info chips */}
              <div className="flex gap-4">
                <VoidPanel
                  hoverable={false}
                  className="flex-1 p-3 bg-gold/5 border-gold/10"
                >
                  <p className="text-[0.6rem] uppercase tracking-widest text-text-secondary mb-1">
                    Humidity
                  </p>
                  <p className="text-gold font-display text-lg">
                    {selected.humidity}%
                  </p>
                </VoidPanel>
                <VoidPanel
                  hoverable={false}
                  className="flex-1 p-3 bg-gold/5 border-gold/10"
                >
                  <p className="text-[0.6rem] uppercase tracking-widest text-text-secondary mb-1">
                    Wind
                  </p>
                  <p className="text-gold font-display text-lg">
                    {selected.wind} km/h
                  </p>
                </VoidPanel>
              </div>
            </div>
          </VoidPanel>
        </motion.div>

        {/* Saved locations sidebar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SectionLabel className="mb-4">Saved Locations</SectionLabel>

          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {saved.length === 0 && (
                <motion.p
                  className="text-text-secondary text-sm text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No saved locations yet.
                  <br />
                  Star a city to add it here.
                </motion.p>
              )}
              {saved.map((city) => (
                <motion.div
                  key={city.city}
                  variants={staggerItem}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                >
                  <VoidPanel
                    className={`p-3 cursor-pointer ${
                      selected.city === city.city
                        ? "border-gold/40"
                        : ""
                    }`}
                    onClick={() => selectCity(city)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{city.icon}</span>
                        <div>
                          <p className="text-text-primary text-sm font-display">
                            {city.city}
                          </p>
                          <p className="text-text-secondary text-xs">
                            {city.weather}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gold font-display text-sm">
                          {city.temperature}&deg;C
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSaved(city.city);
                          }}
                          className="text-text-secondary hover:text-red-400 text-xs transition-colors cursor-pointer"
                          title="Remove"
                        >
                          &#10005;
                        </button>
                      </div>
                    </div>
                  </VoidPanel>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
