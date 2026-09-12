"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Wind,
  MapPin,
  Compass,
} from "lucide-react";

interface DailyForecastItem {
  dayName: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
}

export function getWeatherCondition(code: number): {
  label: string;
  icon: typeof Sun;
  color: string;
} {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return { label: "clear sky", icon: Sun, color: "text-amber-400" };
  if (code === 1 || code === 2 || code === 3)
    return { label: "partly cloudy", icon: Cloud, color: "text-stone-300" };
  if (code === 45 || code === 48)
    return { label: "foggy", icon: Wind, color: "text-stone-400" };
  if (code >= 51 && code <= 55)
    return { label: "drizzle", icon: CloudDrizzle, color: "text-cyan-400" };
  if (code >= 61 && code <= 67)
    return { label: "rain", icon: CloudRain, color: "text-blue-400" };
  if (code >= 71 && code <= 77)
    return { label: "snow", icon: CloudSnow, color: "text-sky-200" };
  if (code >= 80 && code <= 82)
    return { label: "showers", icon: CloudRain, color: "text-cyan-300" };
  if (code >= 95 && code <= 99)
    return { label: "thunderstorm", icon: CloudLightning, color: "text-amber-300" };
  return { label: "fair", icon: Sun, color: "text-amber-400" };
}

export default function ChronoTopBar() {
  const [time, setTime] = useState<Date | null>(null);
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");

  // Weather state
  const [locationName, setLocationName] = useState<string>("NEW YORK");
  const [currentTemp, setCurrentTemp] = useState<number>(30);
  const [currentWeatherCode, setCurrentWeatherCode] = useState<number>(71); // default snow
  const [forecast, setForecast] = useState<DailyForecastItem[]>([
    { dayName: "Sat", weatherCode: 71, maxTemp: 33, minTemp: 23 },
    { dayName: "Sun", weatherCode: 0, maxTemp: 26, minTemp: 18 },
    { dayName: "Mon", weatherCode: 2, maxTemp: 33, minTemp: 21 },
    { dayName: "Tue", weatherCode: 3, maxTemp: 38, minTemp: 32 },
    { dayName: "Wed", weatherCode: 2, maxTemp: 38, minTemp: 30 },
    { dayName: "Thu", weatherCode: 1, maxTemp: 40, minTemp: 32 },
    { dayName: "Fri", weatherCode: 2, maxTemp: 41, minTemp: 34 },
  ]);

  // Sync clock every 1 second
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real weather using geolocation + Open-Meteo
  useEffect(() => {
    let isMounted = true;

    async function fetchWeather(lat: number, lon: number, cityName?: string) {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`
        );
        if (!response.ok) throw new Error("Weather fetch failed");
        const data = await response.json();

        if (isMounted && data.current && data.daily) {
          setCurrentTemp(Math.round(data.current.temperature_2m));
          setCurrentWeatherCode(data.current.weather_code);

          if (cityName) {
            setLocationName(cityName.toUpperCase());
          }

          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const newForecast: DailyForecastItem[] = [];

          const times = (data.daily.time as string[]) || [];
          const codes = (data.daily.weather_code as number[]) || [];
          const maxes = (data.daily.temperature_2m_max as number[]) || [];
          const mins = (data.daily.temperature_2m_min as number[]) || [];

          for (let i = 0; i < Math.min(times.length, 7); i++) {
            const d = new Date(times[i]);
            newForecast.push({
              dayName: days[d.getDay()],
              weatherCode: codes[i] ?? 0,
              maxTemp: Math.round(maxes[i] ?? 32),
              minTemp: Math.round(mins[i] ?? 20),
            });
          }

          if (newForecast.length > 0) {
            setForecast(newForecast);
          }
        }
      } catch (err) {
        console.warn("Using fallback weather:", err);
      }
    }

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          let detectedCity = "LOCAL REALM";
          try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz && tz.includes("/")) {
              detectedCity = tz.split("/")[1].replace(/_/g, " ");
            }
          } catch {}
          fetchWeather(lat, lon, detectedCity);
        },
        () => {
          // Geolocation permission denied or failed; fallback to New York coordinates
          fetchWeather(40.7128, -74.006, "NEW YORK");
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather(40.7128, -74.006, "NEW YORK");
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Life Progression Calculations
  const lifeProgress = useMemo(() => {
    const now = time || new Date();

    // 1. Day percentage
    const secondsInDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const dayPercent = Math.min(100, Math.max(0, Math.round((secondsInDay / 86400) * 100)));

    // 2. Week percentage (0 = Sunday)
    const dayOfWeek = now.getDay();
    const weekProgressSeconds = dayOfWeek * 86400 + secondsInDay;
    const weekPercent = Math.min(100, Math.max(0, Math.round((weekProgressSeconds / (7 * 86400)) * 100)));

    // 3. Month percentage
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDayOfMonth = now.getDate();
    const monthPercent = Math.min(
      100,
      Math.max(0, Math.round(((currentDayOfMonth - 1 + secondsInDay / 86400) / daysInMonth) * 100))
    );

    // 4. Year percentage
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    const yearElapsed = now.getTime() - startOfYear.getTime();
    const totalYearMs = endOfYear.getTime() - startOfYear.getTime();
    const yearPercent = Math.min(100, Math.max(0, Math.round((yearElapsed / totalYearMs) * 100)));

    return {
      year: yearPercent,
      month: monthPercent,
      week: weekPercent,
      day: dayPercent,
    };
  }, [time]);

  // Analog Clock Hands Rotation Angles
  const clockAngles = useMemo(() => {
    if (!time) return { hour: 0, minute: 0, second: 0 };
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondAngle = seconds * 6;
    const minuteAngle = minutes * 6 + seconds * 0.1;
    const hourAngle = (hours % 12) * 30 + minutes * 0.5;

    return { hour: hourAngle, minute: minuteAngle, second: secondAngle };
  }, [time]);

  // Display temperature conversion
  const formatTemp = (f: number) => {
    if (tempUnit === "C") {
      return `${Math.round(((f - 32) * 5) / 9)}°`;
    }
    return `${f}°`;
  };

  const currentWeather = getWeatherCondition(currentWeatherCode);
  const CurrentIcon = currentWeather.icon;

  const digitalTimeString = time
    ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}:${String(
        time.getSeconds()
      ).padStart(2, "0")}`
    : "12:00:00";

  return (
    <div className="w-full bg-[#0d1015]/90 border border-stone-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl mb-6 backdrop-blur-md">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 1. Analog & Digital Clock Widget */}
        <div className="lg:col-span-4 flex items-center justify-center sm:justify-start gap-4 py-1">
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            {/* Clock Face SVG */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Outer dial ring */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="#13171f"
                stroke="#2a303c"
                strokeWidth="2"
              />
              {/* Inner subtle glow */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(245, 158, 11, 0.08)"
                strokeWidth="1"
              />

              {/* 12 Hour Ticks */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 50 + 38 * Math.sin(angle);
                const y1 = 50 - 38 * Math.cos(angle);
                const x2 = 50 + 44 * Math.sin(angle);
                const y2 = 50 - 44 * Math.cos(angle);
                const isMajor = i % 3 === 0;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isMajor ? "#fbbf24" : "#4b5563"}
                    strokeWidth={isMajor ? "2" : "1"}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Hour Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="24"
                stroke="#e2e8f0"
                strokeWidth="3.2"
                strokeLinecap="round"
                transform={`rotate(${clockAngles.hour} 50 50)`}
              />

              {/* Minute Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="15"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${clockAngles.minute} 50 50)`}
              />

              {/* Second Hand */}
              <line
                x1="50"
                y1="56"
                x2="50"
                y2="10"
                stroke="#ef4444"
                strokeWidth="1"
                strokeLinecap="round"
                transform={`rotate(${clockAngles.second} 50 50)`}
              />

              {/* Center Pivot Nut */}
              <circle cx="50" cy="50" r="3" fill="#f59e0b" />
              <circle cx="50" cy="50" r="1.2" fill="#0f172a" />
            </svg>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-mono font-black text-stone-100 tracking-wider">
              {digitalTimeString}
            </div>
            <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5 mt-0.5">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>CHRONOS ENGINE ACTIVE</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              {time?.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              }) || "Today"}
            </div>
          </div>
        </div>

        {/* 2. Live Weather Widget & 7-Day Forecast */}
        <div className="lg:col-span-5 flex flex-col justify-center border-y lg:border-y-0 lg:border-x border-stone-800/80 py-3 lg:py-0 px-0 lg:px-5">
          {/* Header Row: City, Weather summary & Unit toggle */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] tracking-widest text-stone-400 font-mono uppercase">
                  {locationName}
                </div>
                <div className="text-xs font-bold text-stone-200">LOCAL WEATHER</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CurrentIcon className={`w-6 h-6 ${currentWeather.color}`} />
                <div className="text-right">
                  <div className="text-base font-black font-mono text-stone-100 flex items-center gap-1">
                    <span>{formatTemp(currentTemp)}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      {tempUnit === "F" ? "F" : "C"}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400 lowercase capitalize">
                    {currentWeather.label}
                  </div>
                </div>
              </div>

              {/* Unit Toggle Button */}
              <button
                type="button"
                onClick={() => setTempUnit((u) => (u === "F" ? "C" : "F"))}
                className="px-2 py-0.5 rounded bg-stone-800 text-[10px] font-mono text-stone-300 hover:text-amber-300 hover:bg-stone-700 transition-colors border border-stone-700"
                title="Toggle Fahrenheit / Celsius"
              >
                °{tempUnit}
              </button>
            </div>
          </div>

          {/* 7-Day Forecast Horizontal Strip */}
          <div className="grid grid-cols-7 gap-1 pt-2 border-t border-stone-800/60">
            {forecast.map((item, idx) => {
              const cond = getWeatherCondition(item.weatherCode);
              const Icon = cond.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-1 rounded hover:bg-stone-800/40 transition-colors text-center"
                >
                  <span className="text-[10px] font-mono font-medium text-stone-400">
                    {item.dayName}
                  </span>
                  <Icon className={`w-3.5 h-3.5 my-1 ${cond.color}`} />
                  <span className="text-[9px] font-mono font-bold text-stone-200">
                    {formatTemp(item.maxTemp)}
                  </span>
                  <span className="text-[8px] font-mono text-stone-500">
                    {formatTemp(item.minTemp)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Life Elapsed Meters (Year, Month, Week, Day) */}
        <div className="lg:col-span-3 flex flex-col justify-center gap-2.5">
          {/* Year Progress */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="text-stone-400">Year:</span>
              <span className="text-stone-200 font-bold">{lifeProgress.year}%</span>
            </div>
            <div className="w-full h-3 rounded-md bg-[#13171f] p-0.5 border border-stone-700/80 shadow-inner">
              <div
                className="h-full rounded bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                style={{ width: `${lifeProgress.year}%` }}
              />
            </div>
          </div>

          {/* Month Progress */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="text-stone-400">Month:</span>
              <span className="text-stone-200 font-bold">{lifeProgress.month}%</span>
            </div>
            <div className="w-full h-3 rounded-md bg-[#13171f] p-0.5 border border-stone-700/80 shadow-inner">
              <div
                className="h-full rounded bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                style={{ width: `${lifeProgress.month}%` }}
              />
            </div>
          </div>

          {/* Week Progress */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="text-stone-400">Week:</span>
              <span className="text-stone-200 font-bold">{lifeProgress.week}%</span>
            </div>
            <div className="w-full h-3 rounded-md bg-[#13171f] p-0.5 border border-stone-700/80 shadow-inner">
              <div
                className="h-full rounded bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                style={{ width: `${lifeProgress.week}%` }}
              />
            </div>
          </div>

          {/* Day Progress */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="text-stone-400">Day:</span>
              <span className="text-stone-200 font-bold">{lifeProgress.day}%</span>
            </div>
            <div className="w-full h-3 rounded-md bg-[#13171f] p-0.5 border border-stone-700/80 shadow-inner">
              <div
                className="h-full rounded bg-gradient-to-r from-rose-600 to-orange-400 transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                style={{ width: `${lifeProgress.day}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
