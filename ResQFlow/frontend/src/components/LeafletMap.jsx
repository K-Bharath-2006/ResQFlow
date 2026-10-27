import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix Leaflet default marker icons if default markers are used
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Moderate: '#d97706',
  Low: '#0d9488',
};

export default function LeafletMap({
  center = [13.0827, 80.2707],
  zoom = 12,
  areas = [],
  facilities = [],
  roads = [],
  resources = [],
  selectedAreaId = null,
  onAreaClick = null,
  height = '520px',
  interactive = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    polygons: L.layerGroup(),
    hospitals: L.layerGroup(),
    shelters: L.layerGroup(),
    roads: L.layerGroup(),
    depots: L.layerGroup(),
  });

  const [visibleLayers, setVisibleLayers] = useState({
    polygons: true,
    hospitals: true,
    shelters: true,
    roads: true,
    depots: true,
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Reset leaflet ID if container was previously mounted in StrictMode
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    const safeCenter = (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1]))
      ? center
      : [13.0827, 80.2707];

    const map = L.map(mapContainerRef.current, {
      center: safeCenter,
      zoom: zoom,
      zoomControl: true,
      attributionControl: false,
    });

    // Highly reliable OpenStreetMap tile layer
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Attribution control
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a> &bull; ResQFlow GIS Engine')
      .addTo(map);

    // Add layer groups
    Object.values(layersRef.current).forEach((layer) => layer.addTo(map));
    mapInstanceRef.current = map;

    // Invalidate size after DOM layout settles to prevent grey/blank tiles
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleWindowResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Pan / Zoom update when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // Update Flood Polygons & auto-fit bounds
  useEffect(() => {
    const { polygons } = layersRef.current;
    polygons.clearLayers();

    if (!visibleLayers.polygons || !areas || !areas.length) return;

    const allBoundaryPoints = [];

    areas.forEach((area) => {
      let rawCoords = area.polygon_coords;
      if (typeof rawCoords === 'string') {
        try {
          rawCoords = JSON.parse(rawCoords);
        } catch {
          rawCoords = [];
        }
      }

      if (!rawCoords || !rawCoords.length) return;

      rawCoords.forEach((pt) => {
        if (Array.isArray(pt) && pt.length >= 2) {
          allBoundaryPoints.push(pt);
        }
      });

      const color = SEVERITY_COLORS[area.severity] || '#0d9488';
      const isSelected = selectedAreaId === area.id;

      const polygon = L.polygon(rawCoords, {
        color: color,
        weight: isSelected ? 3.5 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.45 : (area.severity === 'Critical' ? 0.38 : 0.25),
        dashArray: isSelected ? '4, 4' : null,
      });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 210px;">
          <div style="font-weight: 700; color: #0f2e5a; font-size: 14px; margin-bottom: 4px;">
            ${area.name}
          </div>
          <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${color}20; color: ${color}; border: 1px solid ${color}40; margin-bottom: 8px;">
            Severity: ${area.severity} (${area.water_depth_m}m depth)
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px;">
            <tr><td style="color: #64748b; padding: 2px 0;">Affected Pop:</td><td style="font-weight: 600; text-align: right;">${Number(area.population || 0).toLocaleString()}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">Buildings:</td><td style="font-weight: 600; text-align: right;">${Number(area.buildings || 0).toLocaleString()}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">Flooded Roads:</td><td style="font-weight: 600; text-align: right;">${area.roads_km || 0} km</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">Hospitals In Danger:</td><td style="font-weight: 600; text-align: right; color: ${(area.hospitals_affected || 0) > 0 ? '#dc2626' : '#059669'};">${area.hospitals_affected || 0}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">Active Shelters:</td><td style="font-weight: 600; text-align: right;">${area.shelters_count || 0}</td></tr>
          </table>
        </div>
      `;

      polygon.bindPopup(popupHtml);
      if (onAreaClick) {
        polygon.on('click', () => onAreaClick(area));
      }
      polygon.addTo(polygons);

      // Area label marker at center
      if (area.center_lat && area.center_lng) {
        const centerIcon = L.divIcon({
          className: 'custom-area-pin',
          html: `<div style="background: #ffffff; border: 2px solid ${color}; color: #0f2e5a; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.15); white-space: nowrap;">${(area.name || '').split('&')[0].trim()}</div>`,
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });
        L.marker([area.center_lat, area.center_lng], { icon: centerIcon })
          .bindPopup(popupHtml)
          .addTo(polygons);
      }
    });

    // If no specific area is selected and we have boundary points, fit view to all areas
    if (mapInstanceRef.current && allBoundaryPoints.length > 0 && !selectedAreaId) {
      try {
        const bounds = L.latLngBounds(allBoundaryPoints);
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
        }
      } catch (err) {
        console.warn('Error fitting map bounds:', err);
      }
    }
  }, [areas, visibleLayers.polygons, selectedAreaId]);

  // Update Facilities (Hospitals & Shelters)
  useEffect(() => {
    const { hospitals, shelters } = layersRef.current;
    hospitals.clearLayers();
    shelters.clearLayers();

    if (!facilities || !facilities.length) return;

    facilities.forEach((fac) => {
      if (!fac.lat || !fac.lng) return;

      const facType = (fac.facility_type || '').toLowerCase();
      const isHospital = facType.includes('hospital') || facType.includes('clinic') || facType.includes('health') || facType.includes('medical');
      const isShelter = facType.includes('shelter') || facType.includes('camp') || facType.includes('school');

      if (isHospital && visibleLayers.hospitals) {
        const facStatus = (fac.status || '').toLowerCase();
        const isFlooded = facStatus.includes('flood') || facStatus.includes('submerged');
        const isIsolated = facStatus.includes('isolated') || facStatus.includes('critical');
        const color = isFlooded ? '#dc2626' : (isIsolated ? '#ea580c' : '#0284c7');
        const iconSymbol = isFlooded ? '⚠️' : '🏥';

        const hospIcon = L.divIcon({
          className: 'facility-marker-hosp',
          html: `<div style="background: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${iconSymbol}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const popup = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 190px;">
            <div style="font-weight: 700; color: #0f2e5a; font-size: 13px;">${fac.name}</div>
            <div style="color: #64748b; font-size: 11px;">Category: Hospital / Healthcare Facility</div>
            <div style="margin-top: 6px;">Status: <b style="color: ${color};">${fac.status || 'Operational'}</b></div>
            <div>Capacity: <b>${fac.capacity || 'N/A'} Beds</b></div>
            <div>Ward: ${fac.area_name || 'Disaster Sector'}</div>
            <div>Emergency Contact: <b>${fac.contact || 'SDMA Control Room'}</b></div>
          </div>
        `;
        L.marker([fac.lat, fac.lng], { icon: hospIcon }).bindPopup(popup).addTo(hospitals);
      }

      if (isShelter && visibleLayers.shelters) {
        const shelterIcon = L.divIcon({
          className: 'facility-marker-shelter',
          html: `<div style="background: #0d9488; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">⛺</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const popup = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 190px;">
            <div style="font-weight: 700; color: #0f2e5a; font-size: 13px;">${fac.name}</div>
            <div style="color: #0d9488; font-size: 11px; font-weight: 600;">Active Disaster Relief Camp</div>
            <div style="margin-top: 6px;">Shelter Capacity: <b>${(fac.capacity || 0).toLocaleString()} Persons</b></div>
            <div>Ward: ${fac.area_name || 'Disaster Sector'}</div>
            <div>Camp Lead: <b>${fac.contact || 'Disaster Cell'}</b></div>
          </div>
        `;
        L.marker([fac.lat, fac.lng], { icon: shelterIcon }).bindPopup(popup).addTo(shelters);
      }
    });
  }, [facilities, visibleLayers.hospitals, visibleLayers.shelters]);

  // Update Roads
  useEffect(() => {
    const { roads: roadLayer } = layersRef.current;
    roadLayer.clearLayers();

    if (!visibleLayers.roads || !roads || !roads.length) return;

    roads.forEach((road) => {
      let coords = road.coords;
      if (typeof coords === 'string') {
        try {
          coords = JSON.parse(coords);
        } catch {
          coords = [];
        }
      }

      if (!coords || !coords.length) return;

      const rStatus = (road.status || '').toLowerCase();
      const isSubmerged = rStatus.includes('submerged') || rStatus.includes('breach');
      const isPartially = rStatus.includes('partially') || rStatus.includes('hazard');

      const polyline = L.polyline(coords, {
        color: isSubmerged ? '#dc2626' : (isPartially ? '#ea580c' : '#0369a1'),
        weight: 4,
        dashArray: isSubmerged ? '6, 6' : (isPartially ? '10, 5' : null),
        opacity: 0.85,
      });

      const popup = `
        <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
          <div style="font-weight: 700; color: #0f2e5a;">${road.name}</div>
          <div>Type: ${road.road_type || 'Road Link'} (${road.length_km || 0} km)</div>
          <div>Condition: <b style="color: ${isSubmerged ? '#dc2626' : (isPartially ? '#ea580c' : '#059669')}; text-transform: uppercase;">${(road.status || 'Passable').replace('_', ' ')}</b></div>
        </div>
      `;
      polyline.bindPopup(popup).addTo(roadLayer);
    });
  }, [roads, visibleLayers.roads]);

  // Update Resource Warehouses / Depots
  useEffect(() => {
    const { depots } = layersRef.current;
    depots.clearLayers();

    if (!visibleLayers.depots || !facilities || !facilities.length) return;

    const warehouses = facilities.filter((f) => {
      const ft = (f.facility_type || '').toLowerCase();
      return ft.includes('warehouse') || ft.includes('depot') || ft.includes('hub') || ft.includes('storage');
    });

    warehouses.forEach((w) => {
      if (!w.lat || !w.lng) return;

      const depotIcon = L.divIcon({
        className: 'facility-marker-depot',
        html: `<div style="background: #1e3a8a; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 15px; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📦</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const popup = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 190px;">
          <div style="font-weight: 700; color: #0f2e5a; font-size: 13px;">${w.name}</div>
          <div style="color: #1e3a8a; font-weight: 600;">Relief Logistics Warehouse Hub</div>
          <div style="margin-top: 4px;">Capacity: <b>${Number(w.capacity || 0).toLocaleString()} units</b></div>
          <div>Contact: ${w.contact || 'SDMA Logistics Command'}</div>
        </div>
      `;
      L.marker([w.lat, w.lng], { icon: depotIcon }).bindPopup(popup).addTo(depots);
    });
  }, [facilities, visibleLayers.depots]);

  const toggleLayer = (key) => {
    setVisibleLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="map-wrapper" style={{ height }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Interactive Layer Toggles */}
      {interactive && (
        <div className="map-layers-toggle">
          <div style={{ fontWeight: 700, color: '#0f2e5a', marginBottom: '2px', fontSize: '11px' }}>MAP LAYERS</div>
          <label className="map-layer-checkbox">
            <input
              type="checkbox"
              checked={visibleLayers.polygons}
              onChange={() => toggleLayer('polygons')}
            />
            <span>Flood Zones ({areas ? areas.length : 0})</span>
          </label>
          <label className="map-layer-checkbox">
            <input
              type="checkbox"
              checked={visibleLayers.hospitals}
              onChange={() => toggleLayer('hospitals')}
            />
            <span>Hospitals & Clinics</span>
          </label>
          <label className="map-layer-checkbox">
            <input
              type="checkbox"
              checked={visibleLayers.shelters}
              onChange={() => toggleLayer('shelters')}
            />
            <span>Relief Shelters</span>
          </label>
          <label className="map-layer-checkbox">
            <input
              type="checkbox"
              checked={visibleLayers.roads}
              onChange={() => toggleLayer('roads')}
            />
            <span>Road Routes & Breaches</span>
          </label>
          <label className="map-layer-checkbox">
            <input
              type="checkbox"
              checked={visibleLayers.depots}
              onChange={() => toggleLayer('depots')}
            />
            <span>Supply Depots / Warehouses</span>
          </label>
        </div>
      )}

      {/* Floating Legend */}
      <div className="map-floating-legend">
        <div className="map-legend-title">Disaster Impact Legend</div>
        <div className="map-legend-items">
          <div className="map-legend-item">
            <div className="legend-color-box" style={{ background: '#dc2626' }}></div>
            <span>Critical Severity (&gt;2m inundation)</span>
          </div>
          <div className="map-legend-item">
            <div className="legend-color-box" style={{ background: '#ea580c' }}></div>
            <span>High Severity (1.2m - 2m depth)</span>
          </div>
          <div className="map-legend-item">
            <div className="legend-color-box" style={{ background: '#d97706' }}></div>
            <span>Moderate Severity (0.6m - 1.2m)</span>
          </div>
          <div className="map-legend-item">
            <div className="legend-color-box" style={{ background: '#0d9488' }}></div>
            <span>Low Severity (&lt;0.6m depth)</span>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />
          <div className="map-legend-item">
            <span style={{ fontSize: '13px' }}>🏥</span>
            <span>Hospital / Health Facility</span>
          </div>
          <div className="map-legend-item">
            <span style={{ fontSize: '13px' }}>⛺</span>
            <span>Emergency Relief Shelter</span>
          </div>
          <div className="map-legend-item">
            <span style={{ fontSize: '13px' }}>📦</span>
            <span>Relief Logistics Warehouse</span>
          </div>
          <div className="map-legend-item">
            <div style={{ width: '16px', height: '3px', background: '#dc2626', borderTop: '2px dashed #dc2626' }}></div>
            <span>Submerged / Severed Road</span>
          </div>
        </div>
      </div>
    </div>
  );
}
