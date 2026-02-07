import React, { useEffect, useState } from "react";
import Sidebar from "./components/SideBar";
import Header from "./components/Header";
import { apiRequest } from "../sr/api/api";
const Monitoring = () => {
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const latest = [...counts].reverse()[0];
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await apiRequest("/detect");
        setCounts(data || []);
      } catch (error) {
        console.error("Error fetching vehicle counts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 2000); // every 2 seconds
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center h-screen pr-10">
      <Sidebar />

      <div className="ml-16 px-10 py-6 mt-20 mr-4 bg-[#131827] rounded text-white flex-1">
        <div className="mb-6">
          <Header />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Video Stream */}
          <div className="col-span-2 rounded-xl p-4">
            <div className="bg-slate-300 rounded-lg aspect-video flex items-center justify-center">
              {loading && (
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              )}

              <img
                className="w-full h-full object-contain"
                src="https://monitoring-python-892386181347.asia-south1.run.app/video_stream"
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                alt="Traffic Stream"
              />
            </div>
          </div>

          {/* Signal Control */}
          <div className="bg-[#0B1E56] rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">SIGNAL</h3>
            <div className="flex flex-col justify-evenly h-full pb-6">
              <button className="bg-red-500 px-6 py-4 rounded-lg font-bold">
                RED
              </button>
              <button className="bg-yellow-400 px-6 py-4 rounded-lg font-bold">
                YELLOW
              </button>
              <button className="bg-green-500 px-6 py-4 rounded-lg font-bold">
                GREEN
              </button>
              <button className="bg-blue-500 px-6 py-4 rounded-lg font-bold">
                AI MODE
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="col-span-2 bg-[#0B1E56] grid grid-cols-2 gap-8 rounded-lg p-10">
            <div className="bg-blue-600 rounded-xl p-6 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4">CONGESTION INDEX</h3>
              {latest ? (
                <div className="bg-purple-700 px-8 py-3 rounded-lg font-bold">
                  {latest.congestion_index}%
                </div>
              ) : (
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            <div className="bg-[#0D98BA] rounded-xl p-6 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4">VEHICLE COUNT</h3>
              {latest ? (
                <div className="bg-purple-700 px-8 py-3 rounded-lg font-bold">
                  {latest.vehicle_count}
                </div>
              ) : (
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
          {/* AI Suggestion */}
          <div className="bg-[#0B1E56] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-6">AI Suggestion :</h3>
            {latest ? (
              <p className="text-2xl font-bold">{latest.suggestion}</p>
            ) : (
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Monitoring;
