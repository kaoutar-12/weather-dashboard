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
      console.log(forcast);
      console.log(data);
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
        <div className="flex h-screen flex-col  items-center bg-[linear-gradient(to_right,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)]">
          <div className="flex pl-[20px] w-full pr-[20px] justify-between items-center h-20">
            <div className="w-[100px] h-8 "></div>
            <div className="w-[900px] h-8 bg-[#444444] rounded-2xl pl-5 flex items-center gap-2">
              <FaSearch className="inline-block text-white" />
              <form onSubmit={onSubmit} className="w-full h-full">
                <input
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  type="text"
                  placeholder="search"
                  className="w-full h-full outline-none rounded-2xl border-none text-white"
                />
              </form>
            </div>
            <div className="w-[200px] h-8 bg-[#041BB1] font-extrabold text-white rounded-2xl flex items-center justify-center gap-2">
              <button className="flex items-center gap-2" onClick={getLocation}>
                <span>Current Location</span>
                <FaMapLocationDot className="text-black" />
              </button>
            </div>
          </div>
          <div className="w-full h-full  flex flex-col items-center justify-center gap-[30px]">
            <div className="w-[90%] h-[45%]  flex gap-[30px]">
              <div className="bg-[linear-gradient(to_right_top,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)] w-1/3 h-full rounded-[30px]  shadow-[20px_0_15px_-6px,0_20px_10px_-6px] shadow-[#111111] flex items-center text-white justify-center flex-col gap-10">
                <div className="text-[26px] font-bold">
                  {data?.name || "Rabat"}
                </div>
                <div className="flex items-center justify-center flex-col">
                  <div className="font-bold text-[96px]">
                    {getLocalTime(data!.dt, data!.timezone)}
                  </div>
                  <div className="text-[20px]">Thursday, 31 Aug</div>
                </div>
              </div>
              <div className="bg-[radial-gradient(circle,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)] shadow-[20px_0_15px_-6px,0_20px_10px_-6px] shadow-[#111111] rounded-4xl w-2/3 h-full flex text-white ">
                <div className="w-1/3 h-full flex flex-col gap-10 items-center justify-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[80px] font-extrabold font-poppins bg-gradient-to-r from-white to-[#5e5e5e] bg-clip-text text-transparent">
                      {convertTemp(data!.main.temp)}°C
                    </span>{" "}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-[#e4e4e4] to-[#c2c2c2] bg-clip-text text-transparent">
                      <span className="text-[20px] font-extrabold">
                        Feels Like:
                      </span>{" "}
                      <span className="text-[32px] font-extrabold">
                        {convertTemp(data!.main.feels_like)}°C
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 items-center justify-center">
                    <div className="flex items-center justify-center gap-5">
                      <BsSunrise className="w-[58px] h-[58px]" />
                      <div className="flex flex-col items-center justify-center text-[20px] font-semibold">
                        <span>Sunrise</span>
                        <span>
                          {getLocalTime(data!.sys.sunrise, data!.timezone)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-5">
                      <BsSunset className="w-[58px] h-[58px]" />
                      <div className="flex flex-col items-center justify-center text-[20px] font-semibold">
                        <span>Sunset</span>
                        <span>
                          {getLocalTime(data!.sys.sunset, data!.timezone)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-1/3 h-full flex items-center justify-center flex-col">
                  <Image
                    src={`https://openweathermap.org/img/wn/${data?.weather[0].icon}@2x.png`}
                    alt="Weather Icon"
                    width={260}
                    height={260}
                  />
                  <span className="text-[32px] font-bold text-white">
                    {data?.weather[0].main}
                  </span>
                </div>
                <div className="w-1/3 h-full ">
                  <div className="w-full h-1/2 flex">
                    <div className="w-1/2 h-full gap-5 flex justify-center items-center flex-col">
                      <div className="flex items-center justify-center gap-2 flex-col">
                        <Image
                          src="/humidity.svg"
                          width={100}
                          height={100}
                          alt="Weather Icon"
                        />
                        <span className="text-[20px] font-bold">
                          {data?.main.humidity}%
                        </span>
                      </div>
                      <span className="text-[16px] font-semibold">
                        Humidity
                      </span>
                    </div>
                    <div className="w-1/2 h-full flex gap-5 justify-center items-center flex-col">
                      <div className="flex items-center justify-center gap-2 flex-col">
                        <Image
                          src="/wind.svg"
                          width={100}
                          height={100}
                          alt="Weather Icon"
                        />
                        <span className="text-[20px] font-bold">
                          {data!.wind.speed} m/s
                        </span>
                      </div>
                      <span className="text-[16px] font-semibold">
                        Wind Speed
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1/2  flex justify-center items-center">
                    <div className="w-1/2 h-full gap-5 flex justify-center items-center flex-col">
                      <div className="flex items-center justify-center gap-2 flex-col">
                        <Image
                          src="/pressure.svg"
                          width={100}
                          height={100}
                          alt="Weather Icon"
                        />
                        <span className="text-[20px] font-bold">
                          {data?.main.pressure} hPa
                        </span>
                      </div>
                      <span className="text-[16px] font-semibold">
                        Pressure
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[90%] h-[45%] flex gap-[10px]">
              <div className="bg-[linear-gradient(to_right_bottom,#0b061d,#121329,#171b37,#1b2445,#1f2d53,#233865,#264377,#274e8a,#285ea6,#266ec3,#1d7fe0,#0091ff)] shadow-[20px_0_15px_-6px,0_20px_10px_-6px] shadow-[#111111] w-full h-full flex flex-col gap-[10px] rounded-4xl justify-center items-center">
                <span className="text-[32px] font-extrabold text-white">
                  Hourly Forecast:
                </span>
                <div className="flex gap-[10px] ">
                  {forcast.map((item, index) => {
                    // Extract the timestamp for the forecast item
                    const forecastTimestamp =
                      new Date(item.dt_txt).getTime() / 1000;

                    // Check if the forecast time is between sunrise and sunset
                    const isDaytime =
                      data?.sys.sunrise && data?.sys.sunset
                        ? forecastTimestamp >= data.sys.sunrise &&
                          forecastTimestamp <= data.sys.sunset
                        : false;

                    return (
                      <div
                        key={index}
                        className={`w-[230px] h-[330px] rounded-[50px] justify-center items-center text-white pt-5 ${
                          isDaytime
                            ? "bg-[linear-gradient(to_bottom,#e19d00,#e1a233,#e1a84f,#dfad68,#dcb37f)]"
                            : "bg-[linear-gradient(to_bottom,#000000,#1d1219,#2c1d32,#2e2e51,#0c4272)]"
                        }`}
                      >
                        <div className="flex items-center justify-center text-[32px] font-bold">
                          {data?.timezone !== undefined
                            ? getLocalTime(
                                new Date(item?.dt_txt).getTime() / 1000,
                                data.timezone
                              )
                            : "Timezone not available"}
                        </div>
                        <div className="flex items-center justify-center flex-col text-[26px] font-bold">
                          <Image
                            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                            alt="Weather Icon"
                            width={100}
                            height={100}
                            className="w-[100px] h-[100px]"
                          />
                          {convertTemp(item.main.temp)}°C
                        </div>
                        <div className="flex items-center justify-center flex-col text-[26px] font-bold">
                          <FaWind className="w-[60px] h-[60px]" />
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
