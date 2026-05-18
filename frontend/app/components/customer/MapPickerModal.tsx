import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Navigation, Loader2, Check } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  isEn: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
}

// Bangkok center
const DEFAULT_LAT = 13.7563;
const DEFAULT_LNG = 100.5018;
const DEFAULT_ZOOM = 13;

// ── Component ────────────────────────────────────────────────────────────────
export function MapPickerModal({ isEn, onClose, onConfirm, initialAddress }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const [address, setAddress] = useState(initialAddress ?? '');
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // ── Init Leaflet map ─────────────────────────────────────────────────────
  useEffect(() => {
    let map: any = null;

    const init = async () => {
      // Dynamic import to avoid SSR / bundle issues
      const L = (await import('leaflet')).default;
      LRef.current = L;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current || leafletMapRef.current) return;

      map = L.map(mapRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Click handler
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        placeMarker(L, map, lat, lng);
        reverseGeocode(lat, lng);
      });

      leafletMapRef.current = map;

      // Invalidate size after modal animation
      setTimeout(() => map.invalidateSize(), 200);
    };

    init();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // ── Place / move marker ──────────────────────────────────────────────────
  const placeMarker = useCallback((L: any, map: any, lat: number, lng: number) => {
    setMarkerPos({ lat, lng });
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }
    map.panTo([lat, lng]);
  }, []);

  // ── Reverse geocode ──────────────────────────────────────────────────────
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': isEn ? 'en' : 'th' } }
      );
      const data = await res.json();
      const resolved = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(resolved);
      setSearchQuery(resolved);
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [isEn]);

  // ── Search handler ───────────────────────────────────────────────────────
  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    setShowResults(false);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=6`,
          { headers: { 'Accept-Language': isEn ? 'en' : 'th' } }
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
        setShowResults(true);
      } catch { /* ignore */ }
      finally { setIsSearching(false); }
    }, 600);
  };

  // ── Pick from search results ─────────────────────────────────────────────
  const handlePickResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const L = LRef.current;
    const map = leafletMapRef.current;
    if (L && map) {
      placeMarker(L, map, lat, lng);
      map.flyTo([lat, lng], 16);
    }
    setMarkerPos({ lat, lng });
    setAddress(result.display_name);
    setSearchQuery(result.display_name);
    setShowResults(false);
    setSearchResults([]);
  };

  // ── GPS ──────────────────────────────────────────────────────────────────
  const handleGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const L = LRef.current;
        const map = leafletMapRef.current;
        if (L && map) {
          placeMarker(L, map, lat, lng);
          map.flyTo([lat, lng], 16);
        }
        reverseGeocode(lat, lng);
      },
      () => alert(isEn ? 'Cannot access location' : 'ไม่สามารถเข้าถึงตำแหน่งได้')
    );
  };

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleConfirm = () => {
    if (!address.trim()) return;
    onConfirm(address, markerPos?.lat ?? DEFAULT_LAT, markerPos?.lng ?? DEFAULT_LNG);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-2xl bg-white dark:bg-[#060f1e] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#0a2540] flex-shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00BDFE]" />
            <h3 className="text-gray-800 dark:text-white">
              {isEn ? 'Pin Delivery Location' : 'ปักหมุดที่อยู่จัดส่ง'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0a2540] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#0a2540] flex-shrink-0" ref={searchBoxRef}>
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#0a2540] bg-gray-50 dark:bg-[#030d1a] focus-within:border-[#00BDFE] transition-colors">
              {isSearching
                ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
                : <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              }
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder={isEn ? 'Search address or place...' : 'ค้นหาที่อยู่หรือสถานที่...'}
                className="flex-1 bg-transparent text-gray-800 dark:text-white text-sm outline-none placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}>
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <button
                onClick={handleGPS}
                title={isEn ? 'Use my location' : 'ใช้ตำแหน่งปัจจุบัน'}
                className="p-1 rounded-lg text-[#00BDFE] hover:bg-[#E8F5FF] dark:hover:bg-[#00BDFE]/15 transition-colors flex-shrink-0"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* Search dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0d1f35] border border-gray-200 dark:border-[#0a2540] rounded-xl shadow-xl z-50 overflow-hidden max-h-52 overflow-y-auto">
                {searchResults.map(r => (
                  <button
                    key={r.place_id}
                    onClick={() => handlePickResult(r)}
                    className="w-full text-left flex items-start gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#0a1828] transition-colors border-b border-gray-50 dark:border-[#0a2540] last:border-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#00BDFE] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {isEn
              ? 'Click anywhere on the map to drop a pin, or search above'
              : 'คลิกบนแผนที่เพื่อปักหมุด หรือค้นหาด้วยชื่อสถานที่'}
          </p>
        </div>

        {/* Map container — Leaflet mounts here via useEffect */}
        <div className="flex-1 relative" style={{ minHeight: '300px' }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%', minHeight: '300px' }} />

          {/* Reverse geocoding overlay */}
          {isReverseGeocoding && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-[1000] pointer-events-none">
              <div className="bg-white dark:bg-[#060f1e] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-lg">
                <Loader2 className="w-4 h-4 text-[#00BDFE] animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {isEn ? 'Getting address...' : 'กำลังค้นหาที่อยู่...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-[#0a2540] flex-shrink-0 space-y-3 bg-white dark:bg-[#060f1e]">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {isEn ? 'Selected address (editable)' : 'ที่อยู่ที่เลือก (แก้ไขได้)'}
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={2}
              placeholder={isEn ? 'Address will appear here after pinning...' : 'ที่อยู่จะปรากฏที่นี่หลังจากปักหมุด...'}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#0a2540] bg-gray-50 dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-[#0a2540] text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#0a2540] transition-colors"
            >
              {isEn ? 'Cancel' : 'ยกเลิก'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!address.trim()}
              className="flex-1 py-3 rounded-xl bg-[#00BDFE] text-white text-sm font-medium hover:bg-[#00CBFE] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEn ? 'Confirm Location' : 'ยืนยันที่อยู่'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
