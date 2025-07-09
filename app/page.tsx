"use client";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { BsSunset } from "react-icons/bs";
import { BsSunrise } from "react-icons/bs";
import { FaWind } from "react-icons/fa";
import { WiHumidity } from "react-icons/wi";

import axios from "axios";

export type WeatherData = {
  name: string;
  wind: {
    speed: number;
    deg: number;
  };
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  weather: {
    icon: string;
    main: string;
    description: string;
  }[];
  timezone: number;
};

export type WeatherForecast = {
  dt_txt: string;
  weather: {
    icon: string;
  }[];
  main: {
    temp: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
};

export default function Home() {
  const [isCelsius, setIsCelsius] = useState(true);
  const [coords, setCoords] = useState({ lat: 22, lng: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<WeatherData | null>(null);
  const [forcast, setForcast] = useState<WeatherForecast[]>([]);

  const getData = async (city: string) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      const forcastData = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${response.data.coord.lat}&lon=${response.data.coord.lon}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      console.log(forcastData.data);
      console.log(response.data);
      setData(response.data);
      const filteredForecast: WeatherForecast[] = forcastData.data.list.splice(
        0,
        7
      );
      setForcast(filteredForecast);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocation = () => {
    setIsLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Latitude:", latitude, "Longitude:", longitude); // Log directly
        setCoords({ lat: latitude, lng: longitude });
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
          );
          setData(response.data);
          const forcastData = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
          );

          const filteredForecast: WeatherForecast[] =
            forcastData.data.list.splice(0, 7);
          setForcast(filteredForecast);
          setIsLoading(false);
        } catch (error) {
          console.log(error);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    console.log("loooooooool ", forcast);
  }, [forcast]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search) {
      setSearch("");
      getData(search);
    }
  };

  const getLocalTime = (timestamp: number, timezone: number) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      // hour12: false,
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const convertTemp = (tempK: number) => {
    return isCelsius
      ? Math.round(tempK - 273.15) // Celsius
      : Math.round(((tempK - 273.15) * 9) / 5 + 32); // Fahrenheit
  };

  useEffect(() => {
    getData("Rabat");
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen w-screen bg-[linear-gradient(to_right,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)]">
          <span className="loader"></span>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center bg-[linear-gradient(to_right,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)]">
          <div className="flex flex-col md:flex-row px-5 justify-between items-center h-auto md:h-20 w-full gap-4 md:gap-0 py-4 md:py-0">
            <div className="w-full md:w-[100px] h-8" />
            <div className="w-full md:w-[900px] h-10 md:h-8 bg-[#444444] rounded-2xl pl-5 flex items-center gap-2">
              <FaSearch className="inline-block text-white" />
              <form onSubmit={onSubmit} className="w-full h-full">
                <input
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  type="text"
                  placeholder="search"
                  className="w-full h-full outline-none rounded-2xl border-none text-white bg-transparent"
                />
              </form>
            </div>
            <div className="w-full md:w-[200px] h-10 md:h-8 bg-[#041BB1] font-extrabold text-white rounded-2xl flex items-center justify-center gap-2">
              <button className="flex items-center gap-2" onClick={getLocation}>
                <span>Current Location</span>
                <FaMapLocationDot className="text-black" />
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-8 md:gap-[30px]">
            {/* Top Section */}
            <div className="w-[95%] flex flex-col md:flex-row gap-8 md:gap-[30px]">
              {/* Left Card */}
              <div className="bg-[linear-gradient(to_right_top,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)] w-full md:w-1/3 h-auto rounded-[30px] shadow-[20px_0_15px_-6px,0_20px_10px_-6px] shadow-[#111111] flex items-center text-white justify-center flex-col gap-10 p-5">
                <div className="text-[26px] font-bold">
                  {data?.name || "Rabat"}
                </div>
                <div className="flex items-center justify-center flex-col">
                  <div className="font-bold text-[56px] md:text-[96px]">
                    {getLocalTime(data!.dt, data!.timezone)}
                  </div>
                  <div className="text-[18px] md:text-[20px]">
                    Thursday, 31 Aug
                  </div>
                </div>
              </div>

              {/* Right Card */}
              <div className="bg-[radial-gradient(circle,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)] shadow-[20px_0_15px_-6px,0_20px_10px_-6px] shadow-[#111111] rounded-4xl w-full md:w-2/3 h-auto flex flex-col md:flex-row text-white">
                {/* Column 1 */}
                <div className="w-full md:w-1/3 flex flex-col gap-10 items-center justify-center p-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[40px] md:text-[80px] font-extrabold font-poppins bg-gradient-to-r from-white to-[#5e5e5e] bg-clip-text text-transparent">
                      {convertTemp(data!.main.temp)}°C
                    </span>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-[#e4e4e4] to-[#c2c2c2] bg-clip-text text-transparent">
                      <span className="text-[16px] md:text-[20px] font-extrabold">
                        Feels Like:
                      </span>
                      <span className="text-[20px] md:text-[32px] font-extrabold">
                        {convertTemp(data!.main.feels_like)}°C
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 items-center justify-center">
                    <div className="flex items-center justify-center gap-5">
                      <BsSunrise className="w-[40px] md:w-[58px] h-[40px] md:h-[58px]" />
                      <div className="flex flex-col items-center justify-center text-[16px] md:text-[20px] font-semibold">
                        <span>Sunrise</span>
                        <span>
                          {getLocalTime(data!.sys.sunrise, data!.timezone)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-5">
                      <BsSunset className="w-[40px] md:w-[58px] h-[40px] md:h-[58px]" />
                      <div className="flex flex-col items-center justify-center text-[16px] md:text-[20px] font-semibold">
                        <span>Sunset</span>
                        <span>
                          {getLocalTime(data!.sys.sunset, data!.timezone)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="w-full md:w-1/3 flex items-center justify-center flex-col p-4">
                  <Image
                    src={`https://openweathermap.org/img/wn/${data?.weather[0].icon}@2x.png`}
                    alt="Weather Icon"
                    width={160}
                    height={160}
                  />
                  <span className="text-[24px] md:text-[32px] font-bold text-white">
                    {data?.weather[0].main}
                  </span>
                </div>

                {/* Column 3 */}
                <div className="w-full md:w-1/3 p-4">
                  <div className="flex flex-wrap md:flex-nowrap">
                    <div className="w-1/2 flex flex-col items-center justify-center gap-2">
                      <Image
                        src="/humidity.svg"
                        width={60}
                        height={60}
                        alt="Humidity"
                      />
                      <span className="text-[18px] md:text-[20px] font-bold">
                        {data?.main.humidity}%
                      </span>
                      <span className="text-[14px] md:text-[16px] font-semibold">
                        Humidity
                      </span>
                    </div>
                    <div className="w-1/2 flex flex-col items-center justify-center gap-2">
                      <Image
                        src="/wind.svg"
                        width={60}
                        height={60}
                        alt="Wind"
                      />
                      <span className="text-[18px] md:text-[20px] font-bold">
                        {data!.wind.speed} m/s
                      </span>
                      <span className="text-[14px] md:text-[16px] font-semibold">
                        Wind Speed
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center mt-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Image
                        src="/pressure.svg"
                        width={60}
                        height={60}
                        alt="Pressure"
                      />
                      <span className="text-[18px] md:text-[20px] font-bold">
                        {data?.main.pressure} hPa
                      </span>
                      <span className="text-[14px] md:text-[16px] font-semibold">
                        Pressure
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="w-[95%] flex flex-col gap-4">
              <div className="bg-[linear-gradient(to_right_bottom,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)] shadow-[20px_0_15px_-6px,0_20px_10px_-6px] shadow-[#111111] w-full flex flex-col gap-[10px] rounded-4xl justify-center items-center p-4">
                <span className="text-[24px] md:text-[32px] font-extrabold text-white">
                  Hourly Forecast:
                </span>
                <div className="flex overflow-x-auto gap-[10px] w-full justify-start md:justify-center">
                  {forcast.map((item, index) => {
                    const forecastTimestamp =
                      new Date(item.dt_txt).getTime() / 1000;
                    const isDaytime =
                      data?.sys.sunrise && data?.sys.sunset
                        ? forecastTimestamp >= data.sys.sunrise &&
                          forecastTimestamp <= data.sys.sunset
                        : false;

                    return (
                      <div
                        key={index}
                        className={`min-w-[180px] md:min-w-[230px] h-[330px] rounded-[30px] justify-center items-center text-white pt-5 flex flex-col ${
                          isDaytime
                            ? "bg-[linear-gradient(to_bottom,#e19d00,#e1a233,#e1a84f,#dfad68,#dcb37f)]"
                            : "bg-[linear-gradient(to_bottom,#000000,#1d1219,#2c1d32,#2e2e51,#0c4272)]"
                        }`}
                      >
                        <div className="flex items-center justify-center text-[20px] md:text-[32px] font-bold">
                          {data?.timezone !== undefined
                            ? getLocalTime(
                                new Date(item?.dt_txt).getTime() / 1000,
                                data.timezone
                              )
                            : "Timezone not available"}
                        </div>
                        <div className="flex items-center justify-center flex-col text-[20px] md:text-[26px] font-bold">
                          <Image
                            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                            alt="Weather Icon"
                            width={100}
                            height={100}
                          />
                          {convertTemp(item.main.temp)}°C
                        </div>
                        <div className="flex items-center justify-center flex-col text-[20px] md:text-[26px] font-bold">
                          <FaWind className="w-[40px] md:w-[60px] h-[40px] md:h-[60px]" />
                          {item.wind.speed} m/s
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
