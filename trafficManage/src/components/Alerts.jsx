import React, { useEffect, useState, memo } from "react";
import { apiRequest } from "../api/api";

const Alerts = memo(() => {
  const [alerts, setAlerts] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(false);

  const truncateLocation = (location) => {
    if (!location || location === "Loading location...") return location;
    const words = location.split(" ");
    return words.length > 8
      ? words.slice(0, 8).join(" ") + "..."
      : location;
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/alerts");
        setAlerts(data || []);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getLocationForAlert = (alertId, lat, lng) => {
    if (!window.google || !lat || !lng) return;

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        setLocations((prev) => ({
          ...prev,
          [alertId]: results[0].formatted_address,
        }));
      }
    });
  };

  useEffect(() => {
    alerts.slice(0, 3).forEach((alert, index) => {
      const coords = alert.geometry?.coordinates?.[0];
      if (coords?.length >= 2) {
        const alertId = alert.properties?.id || index;
        getLocationForAlert(alertId, coords[1], coords[0]);
      }
    });
  }, [alerts]);

  if (loading) {
    return (
      <div className="p-3 text-white flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="text-sm">Loading alerts...</span>
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div className="p-3 bg-[#D9D9D9] text-black rounded text-center">
        <p className="text-sm">No alerts available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {alerts.slice(0, 3).map((alert, index) => {
        const alertId = alert.properties?.id || index;
        const location = locations[alertId] || "Loading location...";
        const event =
          alert.properties?.events?.[0]?.description || "Traffic incident";

        return (
          <div
            key={alertId}
            className="p-3 bg-[#B0B7C8] text-black rounded"
          >
            <p className="text-sm">
              <strong>
                {event} on {truncateLocation(location)}
              </strong>
            </p>
          </div>
        );
      })}
    </div>
  );
});

export default Alerts;
