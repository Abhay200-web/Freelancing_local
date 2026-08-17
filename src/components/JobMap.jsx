import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Create a custom modern SVG marker icon to prevent path issues and look premium
const createCustomIcon = (color = '#0284c7') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        border: 2px solid #ffffff;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

// Component to handle map clicks and move the pin (when in editing mode)
const LocationPicker = ({ position, onChange }) => {
  useMapEvents({
    click(e) {
      if (onChange) {
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={createCustomIcon('#ef4444')} />
  ) : null;
};

// Map center updater when position changes externally
const ChangeMapCenter = ({ position }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);
  return null;
};

export const JobMap = ({ position, onChange, isReadOnly = false, zoom = 12 }) => {
  const defaultCenter = { lat: 9.9816, lng: 76.2999 }; // Kochi default center
  const centerPos = position && position.lat ? [position.lat, position.lng] : [defaultCenter.lat, defaultCenter.lng];

  return (
    <div className="map-wrapper" style={{ height: '260px', position: 'relative' }}>
      <MapContainer
        center={centerPos}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={!isReadOnly}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        {isReadOnly ? (
          position && position.lat ? (
            <Marker position={[position.lat, position.lng]} icon={createCustomIcon('#0284c7')} />
          ) : null
        ) : (
          <LocationPicker position={position} onChange={onChange} />
        )}
        <ChangeMapCenter position={position && position.lat ? position : null} />
      </MapContainer>
      
      {!isReadOnly && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          right: '8px',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#e2e8f0',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
          textAlign: 'center'
        }}>
          Tap anywhere on the map to pin the job location
        </div>
      )}
    </div>
  );
};
