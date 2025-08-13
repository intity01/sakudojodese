// SAKULANG Location Service
// Privacy-first location features with user consent

interface LocationData {
  country?: string;
  countryCode?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationSettings {
  enabled: boolean;
  shareCountry: boolean;
  shareCity: boolean;
  shareTimezone: boolean;
  shareCoordinates: boolean;
}

class LocationService {
  private settings: LocationSettings = {
    enabled: false,
    shareCountry: true,
    shareCity: false,
    shareTimezone: true,
    shareCoordinates: false
  };

  private cachedLocation: LocationData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('sakulang-location-settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load location settings:', error);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('sakulang-location-settings', JSON.stringify(this.settings));
  }

  // Update Settings
  updateSettings(newSettings: Partial<LocationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // Clear cached location if permissions changed
    if (!this.settings.enabled) {
      this.cachedLocation = null;
      localStorage.removeItem('sakulang-location-cache');
    }
  }

  getSettings(): LocationSettings {
    return { ...this.settings };
  }

  // Get Location with Privacy Controls
  async getLocation(): Promise<LocationData | null> {
    if (!this.settings.enabled) {
      return null;
    }

    // Return cached location if still valid
    if (this.cachedLocation && (Date.now() - this.lastFetch) < this.CACHE_DURATION) {
      return this.filterLocationData(this.cachedLocation);
    }

    try {
      // Try IP-based location first (more privacy-friendly)
      const ipLocation = await this.getLocationFromIP();
      
      // Optionally get GPS location if user consents
      let gpsLocation: LocationData | null = null;
      if (this.settings.shareCoordinates) {
        gpsLocation = await this.getLocationFromGPS();
      }

      // Combine data
      const location: LocationData = {
        ...ipLocation,
        ...gpsLocation
      };

      this.cachedLocation = location;
      this.lastFetch = Date.now();
      
      // Cache for offline use
      localStorage.setItem('sakulang-location-cache', JSON.stringify({
        location,
        timestamp: this.lastFetch
      }));

      return this.filterLocationData(location);
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }

  // IP-based Location (Privacy-friendly)
  private async getLocationFromIP(): Promise<LocationData> {
    try {
      // Using a privacy-focused IP geolocation service
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'User-Agent': 'SAKULANG/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error('IP location service unavailable');
      }

      const data = await response.json();
      
      return {
        country: data.country_name,
        countryCode: data.country_code,
        city: data.city,
        timezone: data.timezone
      };
    } catch (error) {
      console.warn('IP location failed, using fallback:', error);
      
      // Fallback to browser timezone
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }
  }

  // GPS Location (Requires explicit permission)
  private async getLocationFromGPS(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: false, // Privacy: use less accurate location
        timeout: 10000,
        maximumAge: 600000 // 10 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          console.warn('GPS location failed:', error);
          resolve(null);
        },
        options
      );
    });
  }

  // Filter location data based on privacy settings
  private filterLocationData(location: LocationData): LocationData {
    const filtered: LocationData = {};

    if (this.settings.shareCountry && location.country) {
      filtered.country = location.country;
      if (location.countryCode) {
        filtered.countryCode = location.countryCode;
      }
    }

    if (this.settings.shareCity && location.city) {
      filtered.city = location.city;
    }

    if (this.settings.shareTimezone && location.timezone) {
      filtered.timezone = location.timezone;
    }

    if (this.settings.shareCoordinates && location.coordinates) {
      filtered.coordinates = location.coordinates;
    }

    return filtered;
  }

  // Get User's Timezone
  getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // Get User's Language/Locale
  getUserLocale(): string {
    return navigator.language || 'en-US';
  }

  // Privacy Methods
  clearLocationData(): void {
    this.cachedLocation = null;
    this.lastFetch = 0;
    localStorage.removeItem('sakulang-location-cache');
  }

  // Get anonymized location for analytics
  async getAnonymizedLocation(): Promise<{ country?: string; timezone?: string }> {
    if (!this.settings.enabled || !this.settings.shareCountry) {
      return {};
    }

    const location = await this.getLocation();
    const result: { country?: string; timezone?: string } = {};
    
    if (location?.country) {
      result.country = location.country;
    }
    
    if (location?.timezone) {
      result.timezone = location.timezone;
    }
    
    return result;
  }

  // Check if location features are available
  isLocationAvailable(): boolean {
    return 'geolocation' in navigator || true; // IP location always available
  }

  // Request location permission
  async requestLocationPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        return true;
      }

      if (permission.state === 'denied') {
        return false;
      }

      // Try to get location to trigger permission prompt
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 5000 }
        );
      });
    } catch (error) {
      console.error('Location permission check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const locationService = new LocationService();

// React Hook
import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [settings, setSettings] = useState<LocationSettings>(locationService.getSettings());
  const [loading, setLoading] = useState(false);

  const updateSettings = (newSettings: Partial<LocationSettings>) => {
    locationService.updateSettings(newSettings);
    setSettings(locationService.getSettings());
  };

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const loc = await locationService.getLocation();
      setLocation(loc);
    } catch (error) {
      console.error('Failed to fetch location:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    const granted = await locationService.requestLocationPermission();
    if (granted) {
      updateSettings({ shareCoordinates: true });
      await fetchLocation();
    }
    return granted;
  };

  useEffect(() => {
    if (settings.enabled) {
      fetchLocation();
    }
  }, [settings.enabled]);

  return {
    location,
    settings,
    loading,
    updateSettings,
    fetchLocation,
    requestPermission,
    clearLocationData: locationService.clearLocationData.bind(locationService),
    getUserTimezone: locationService.getUserTimezone.bind(locationService),
    getUserLocale: locationService.getUserLocale.bind(locationService)
  };
};