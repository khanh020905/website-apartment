import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Building2, Settings, Edit2, Trash2, X, Home, Map as MapIcon, Building, Bed, Briefcase, Zap, Droplet, Bike, ShieldCheck, Camera, Wind, Waves, User, Clock, Monitor, Heart, Shield, Trash, ChevronLeft, Navigation, Wifi, Car, Flame, ArrowUpCircle, Box, ChevronDown } from "lucide-react";
import Modal from "../components/modals/Modal";
import { api } from "../lib/api";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker position={position} />
  );
}

function MapSearch({ onSelect }: { onSelect: (lat: number, lng: number, addr: string) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const map = useMap();

  // Debounce search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const bounds = map.getBounds();
          const center = map.getCenter();
          const viewbox = bounds.toBBoxString(); // Returns "southwest_lng,southwest_lat,northeast_lng,northeast_lat"
          
          // Step 1: Try strict search in current viewbox first
          let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=20&addressdetails=1&viewbox=${viewbox}&bounded=1&accept-language=vi&countrycodes=vn`);
          let data = await res.json();
          
          // Step 2: If no local results, try biasing (bounded=0)
          if (!data || data.length === 0) {
            res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=20&addressdetails=1&viewbox=${viewbox}&bounded=0&accept-language=vi&countrycodes=vn`);
            data = await res.json();
          }

          // Step 3: Advanced sorting (Distance + Relevancy)
          if (data && data.length > 0) {
            data.sort((a: any, b: any) => {
              // 1. Distance score (smaller is better)
              const distA = Math.pow(parseFloat(a.lat) - center.lat, 2) + Math.pow(parseFloat(a.lon) - center.lng, 2);
              const distB = Math.pow(parseFloat(b.lat) - center.lat, 2) + Math.pow(parseFloat(b.lon) - center.lng, 2);
              
              // 2. Relevancy score (string match)
              const nameA = a.display_name.toLowerCase();
              const nameB = b.display_name.toLowerCase();
              const q = query.toLowerCase();
              
              const matchA = nameA.includes(q) ? 0 : 1;
              const matchB = nameB.includes(q) ? 0 : 1;

              // Priority: String Match first, then Distance
              if (matchA !== matchB) return matchA - matchB;
              return distA - distB;
            });
          }

          // Step 4: Final filter (Strictly remove results further than 50km if possible, as fallback)
          // But we'll keep them in tier 3 if needed. 
          
          setSuggestions(data.slice(0, 10)); // Top 10 best matches
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = (item: any) => {
    const latitude = parseFloat(item.lat);
    const longitude = parseFloat(item.lon);
    map.flyTo([latitude, longitude], 16);
    onSelect(latitude, longitude, item.display_name);
    setQuery(item.display_name);
    setShowSuggestions(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] space-y-1">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 2 && setShowSuggestions(true)}
            placeholder="Tìm kiếm địa chỉ..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium shadow-lg focus:outline-none focus:border-brand-primary"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brand-dark transition-all disabled:opacity-50"
        >
          {loading ? 'đang tìm...' : 'Tìm'}
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden max-h-[250px] overflow-y-auto">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
            >
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-700 line-clamp-1">{item.name || item.display_name.split(',')[0]}</p>
                <p className="text-[11px] text-slate-400 line-clamp-1">{item.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Room {
  id: string;
}

interface Building {
  id: string;
  name: string;
  address: string;
  services: string[];
  phone: string;
  floors: number;
  rooms: Room[];
  status: "active" | "inactive";
  website?: string;
  images?: string[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedStructure, setSelectedStructure] = useState("");
  const [_currentStep, setCurrentStep] = useState(1);

  // Form states for services & amenities
  const [meteredServices, setMeteredServices] = useState([
    { id: 'dien', name: 'Điện', price: 4000, unit: 'kWh', icon: Zap },
  ]);
  const [fixedServices, setFixedServices] = useState([
    { id: 'xe_may', name: 'Giữ xe máy', price: 100000, unit: 'chiếc', icon: Bike },
    { id: 'nuoc_may', name: 'Nước máy', price: 100000, unit: 'người', icon: Droplet },
    { id: 'phi_dv', name: 'Phí dịch vụ', price: 150000, unit: 'phòng', icon: Settings },
  ]);

  const allAmenities = [
    { id: 'no_owner', label: 'Không chung chủ', icon: User },
    { id: 'free_time', label: 'Giờ giấc tự do', icon: Clock },
    { id: 'elevator', label: 'Có thang máy', icon: Building2 },
    { id: 'parking_bike', label: 'Giữ xe máy', icon: Bike },
    { id: 'parking_electric', label: 'Giữ xe điện', icon: Zap },
    { id: 'parking_car', label: 'Đậu xe ô tô', icon: Building },
    { id: 'pets', label: 'Nuôi thú cưng', icon: Heart },
    { id: 'security', label: 'Bảo vệ 24/24', icon: ShieldCheck },
    { id: 'camera', label: 'Camera 24/24', icon: Camera },
    { id: 'fingerprint', label: 'Cổng vân tay', icon: Shield },
    { id: 'rooftop', label: 'Sân thượng', icon: Wind },
    { id: 'cleaning', label: 'Vệ sinh hành lang', icon: Trash },
    { id: 'laundry_common', label: 'Máy giặt chung', icon: Monitor },
    { id: 'wc_common', label: 'WC chung', icon: Waves },
    { id: 'foreigners', label: 'Nhận khách nước ngoài', icon: User },
  ];

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isAddAmenityModalOpen, setIsAddAmenityModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceUnit, setNewServiceUnit] = useState("phòng");
  const [newServiceType, setNewServiceType] = useState<"metered" | "fixed">("fixed");
  const [newAmenityName, setNewAmenityName] = useState("");
  
  const [address, setAddress] = useState("");
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCoords, setMapCoords] = useState<[number, number] | null>(null);

  const rentalTypes = [
    { id: 'can_ho_dich_vu', label: 'Căn hộ dịch vụ', icon: Building2 },
    { id: 'nha_tro', label: 'Nhà trọ', icon: Building2 },
    { id: 'nha_rieng', label: 'Nhà riêng', icon: Home },
    { id: 'mat_bang', label: 'Mặt bằng', icon: MapIcon },
    { id: 'chung_cu', label: 'Chung cư', icon: Building },
    { id: 'ktx_sleep_box', label: 'KTX / Sleep Box', icon: Bed },
    { id: 'van_phong', label: 'Vành phòng', icon: Briefcase },
  ];

  const serviceTemplates = [
    { id: 'phi_dv', name: 'Phí dịch vụ', icon: Settings, defaultPrice: 150000, defaultUnit: 'phòng' },
    { id: 'dien', name: 'Điện', icon: Zap, defaultPrice: 4000, defaultUnit: 'kWh' },
    { id: 'nuoc_may', name: 'Nước máy', icon: Droplet, defaultPrice: 100000, defaultUnit: 'người' },
    { id: 'an_ninh', name: 'An ninh', icon: ShieldCheck, defaultPrice: 50000, defaultUnit: 'phòng' },
    { id: 'wifi', name: 'Wifi', icon: Wifi, defaultPrice: 50000, defaultUnit: 'phòng' },
    { id: 'xe_dap', name: 'Giữ xe đạp', icon: Bike, defaultPrice: 50000, defaultUnit: 'chiếc' },
    { id: 'xe_may', name: 'Giữ xe máy', icon: Bike, defaultPrice: 100000, defaultUnit: 'chiếc' },
    { id: 'cap', name: 'Truyền hình', icon: Monitor, defaultPrice: 50000, defaultUnit: 'phòng' },
    { id: 've_sinh', name: 'Vệ sinh', icon: Trash, defaultPrice: 30000, defaultUnit: 'tháng' },
    { id: 'xe_oto', name: 'Giữ xe ô tô', icon: Car, defaultPrice: 500000, defaultUnit: 'chiếc' },
    { id: 'pccc', name: 'PCCC', icon: Flame, defaultPrice: 20000, defaultUnit: 'phòng' },
    { id: 'thang_may', name: 'Thang máy', icon: ArrowUpCircle, defaultPrice: 50000, defaultUnit: 'người' },
    { id: 'bai_xe', name: 'Bãi Đậu Xe', icon: MapPin, defaultPrice: 100000, defaultUnit: 'tháng' },
    { id: 'do_rac', name: 'Đổ Rác', icon: Trash2, defaultPrice: 20000, defaultUnit: 'phòng' },
    { id: 'khac', name: 'Khác', icon: Plus, defaultPrice: 0, defaultUnit: 'lần' },
  ];

  const [selectedServiceTemplate, setSelectedServiceTemplate] = useState<string | null>(null);

  const structureOptions = [
    { id: 'nguyen_can', label: 'Nguyên căn', icon: Home },
    { id: 'nha_phong', label: 'Nhà -> Phòng', icon: Building2 },
    { id: 'nha_tang_phong', label: 'Nhà -> Tầng -> Phòng', icon: Building2 },
    { id: 'nha_day_tang_phong', label: 'Nhà -> Khu/Dãy -> Tầng -> Phòng', icon: Building2 },
    { id: 'nha_mat_bang', label: 'Nhà -> Mặt bằng', icon: MapIcon },
    { id: 'chung_cu_tang_phong', label: 'Chung cư -> Tầng -> Phòng', icon: Building },
    { id: 'chung_cu_khu_tang_phong', label: 'Chung cư -> Khu -> Tầng -> Phòng', icon: Building },
    { id: 'ktx_phong_giuong', label: 'Nhà -> Phòng -> Giường', icon: Bed },
    { id: 'ktx_tang_phong_giuong', label: 'Nhà -> Tầng -> Phòng -> Giường', icon: Bed },
  ];

  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");



  const fetchLocations = async () => {
    try {
      const res = await api.get<{ buildings: Building[] }>("/api/buildings");
      setLocations(res.data?.buildings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      phone: form.get("phone") as string,
      address: address, // Use the state which matches map coords
      floors: parseInt(form.get("floors") as string, 10),
      website: form.get("website") as string,
      status: form.get("status") as string || 'active',
      images: (form.get("images") as string || "").split(",").map(s => s.trim()).filter(Boolean),
      rental_type: selectedType,
      structure_type: selectedStructure,
      amenities: selectedAmenities,
      metered_services: meteredServices,
      fixed_services: fixedServices,
      lat: mapCoords?.[0] || null,
      lng: mapCoords?.[1] || null,
    };

    try {
      if (editingBuilding) {
        await api.put(`/api/buildings/${editingBuilding.id}`, data);
      } else {
        await api.post("/api/buildings", data);
      }
      setIsModalOpen(false);
      setEditingBuilding(null);
      setCurrentStep(1); // Reset step
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá toà nhà này?")) return;
    try {
      await api.delete(`/api/buildings/${id}`);
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Đã xảy ra lỗi. Toà nhà có thể vẫn còn phòng.");
    }
  };

  const openCreateModal = () => {
    setEditingBuilding(null);
    setAddress("");
    setMapCoords(null);
    setSelectedAmenities([]);
    setSelectedType("");
    setSelectedStructure("");
    // Reset to standard defaults for new building
    setMeteredServices([{ id: 'dien', name: 'Điện', price: 4000, unit: 'kWh', icon: Zap }]);
    setFixedServices([
      { id: 'xe_may', name: 'Giữ xe máy', price: 100000, unit: 'chiếc', icon: Bike },
      { id: 'nuoc_may', name: 'Nước máy', price: 100000, unit: 'người', icon: Droplet },
      { id: 'phi_dv', name: 'Phí dịch vụ', price: 150000, unit: 'phòng', icon: Settings },
    ]);
    setIsTypeModalOpen(true);
  };

  const handleSelectType = (typeLabel: string) => {
    setSelectedType(typeLabel);
    setIsTypeModalOpen(false);
    
    if (typeLabel === 'Văn phòng') {
      setIsModalOpen(true);
    } else {
      setIsStructureModalOpen(true);
    }
  };

  const handleSelectStructure = (structureLabel: string) => {
    setSelectedStructure(structureLabel);
    setIsStructureModalOpen(false);
    setIsModalOpen(true);
  };

  const handleAddService = () => {
    if (!newServiceName || !newServicePrice) return;
    
    // Convert formatted string (e.g. "150.000") to number
    const numericPrice = parseInt(newServicePrice.replace(/\./g, ''), 10);
    
    const newService = {
      id: `custom_${Date.now()}`,
      name: newServiceName,
      price: numericPrice,
      unit: newServiceUnit,
      icon: newServiceType === "metered" ? Zap : Box
    };

    if (newServiceType === "metered") {
      setMeteredServices([...meteredServices, newService]);
    } else {
      setFixedServices([...fixedServices, newService]);
    }

    setNewServiceName("");
    setNewServicePrice("");
    setSelectedServiceTemplate(null);
    setIsAddServiceModalOpen(false);
  };

  const formatCurrencyInput = (value: string) => {
     // Remove non-numeric characters
     const numericValue = value.replace(/\D/g, '');
     if (!numericValue) return "";
     // Format with dots
     return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue, 10)).replace(/,/g, '.');
  };

  const selectServiceTemplate = (template: any) => {
    setSelectedServiceTemplate(template.id);
    setNewServiceName(template.name);
    // Format the default price before setting state
    setNewServicePrice(formatCurrencyInput(template.defaultPrice.toString()));
    setNewServiceUnit(template.defaultUnit);
    // Auto toggle type based on name
    if (template.name === 'Điện' || template.name === 'Nước máy') {
       setNewServiceType('metered');
    } else {
       setNewServiceType('fixed');
    }
  };

  const handleAddCustomAmenity = () => {
    if (!newAmenityName) return;
    // We can't easily add to allAmenities because it's a fixed array of objects with icons
    // But we can add it to the selected list directly or handle it as a custom field
    // For now, let's just add it to the selectedAmenities with a prefix
    setSelectedAmenities([...selectedAmenities, newAmenityName]);
    setNewAmenityName("");
    setIsAddAmenityModalOpen(false);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCoords([latitude, longitude]);
        try {
          // Reverse geocoding using Nominatim (free)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          setAddress(`${latitude}, ${longitude}`);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setLocationLoading(false);
        alert("Không thể lấy vị trí hiện tại. Vui lòng cấp quyền truy cập.");
      }
    );
  };

  const handleMapSelect = (lat: number, lng: number, addr?: string) => {
    setMapCoords([lat, lng]);
    if (addr) setAddress(addr);
    setIsMapPickerOpen(false);
  };

  const handleOpenMapPicker = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCoords([latitude, longitude]);
        setLocationLoading(false);
        setIsMapPickerOpen(true);
      },
      (err) => {
        console.error(err);
        setLocationLoading(false);
        // Fallback to a central point if location fails, then open
        setMapCoords([10.79, 106.685]); 
        setIsMapPickerOpen(true);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const getSelectedTypeIcon = () => {
    const type = rentalTypes.find(t => t.label === selectedType);
    return type ? type.icon : Building2;
  };

  const StructureIcon = getSelectedTypeIcon();

  const getFilteredStructureOptions = () => {
    if (selectedType === 'Nhà riêng') {
      return structureOptions.filter(opt => ['nguyen_can', 'nha_phong', 'nha_tang_phong'].includes(opt.id));
    }
    if (selectedType === 'Mặt bằng') {
      return structureOptions.filter(opt => ['nguyen_can', 'nha_mat_bang'].includes(opt.id));
    }
    if (selectedType === 'Chung cư') {
      return structureOptions.filter(opt => ['nguyen_can', 'chung_cu_tang_phong', 'chung_cu_khu_tang_phong'].includes(opt.id));
    }
    if (selectedType === 'KTX / Sleep Box') {
      return structureOptions.filter(opt => ['nguyen_can', 'ktx_phong_giuong', 'ktx_tang_phong_giuong'].includes(opt.id));
    }
    return structureOptions.filter(opt => !['nha_mat_bang', 'chung_cu_tang_phong', 'chung_cu_khu_tang_phong', 'ktx_phong_giuong', 'ktx_tang_phong_giuong'].includes(opt.id));
  };

  const filteredStructureOptions = getFilteredStructureOptions();

  const openEditModal = (b: any) => {
    setEditingBuilding(b);
    setAddress(b.address || "");
    if (b.lat && b.lng) {
      setMapCoords([b.lat, b.lng]);
    } else {
      setMapCoords(null);
    }
    setSelectedAmenities(b.amenities || []);
    setSelectedType(b.rental_type || "");
    setSelectedStructure(b.structure_type || "");
    
    // Restore detailed services
    if (b.metered_services && b.metered_services.length > 0) {
      setMeteredServices(b.metered_services);
    } else {
      setMeteredServices([{ id: 'dien', name: 'Điện', price: 4000, unit: 'kWh', icon: Zap }]);
    }

    if (b.fixed_services && b.fixed_services.length > 0) {
      setFixedServices(b.fixed_services);
    } else {
      setFixedServices([
        { id: 'xe_may', name: 'Giữ xe máy', price: 100000, unit: 'chiếc', icon: Bike },
        { id: 'nuoc_may', name: 'Nước máy', price: 100000, unit: 'người', icon: Droplet },
        { id: 'phi_dv', name: 'Phí dịch vụ', price: 150000, unit: 'phòng', icon: Settings },
      ]);
    }

    setIsModalOpen(true);
  };

  useEffect(() => {
    // Logic for auto-centering removed to avoid jumping
  }, [isMapPickerOpen]);

  const filteredLocations = locations.filter(loc => {
    if (search && !loc.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && loc.status !== filterStatus) return false;
    if (filterService && (!loc.services || !loc.services.some(s => s.toLowerCase().includes(filterService.toLowerCase())))) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Cơ sở / Toà nhà</h1>
        </div>
        
        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[320px] flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm tên toà nhà..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all font-medium"
            />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={filterService} 
               onChange={(e) => setFilterService(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
             >
               <option value="">Chọn dịch vụ</option>
               <option value="sleep_box">Sleep box</option>
               <option value="studio">Studio</option>
               <option value="1pn">Căn hộ 1PN</option>
             </select>
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={filterStatus} 
               onChange={(e) => setFilterStatus(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
             >
               <option value="">Tất cả trạng thái</option>
               <option value="active">Đang hoạt động</option>
               <option value="inactive">Đã đóng cửa</option>
             </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
             <button 
               onClick={openCreateModal}
               className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-[13px] font-bold transition-colors hover:bg-brand-dark shadow-sm whitespace-nowrap cursor-pointer"
             >
               <Plus className="w-4 h-4 font-bold" /> Thêm toà nhà
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - REDESIGNED TO CARD LAYOUT */}
      <div className="flex-1 overflow-auto p-6 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            <h2 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">Danh sách toà nhà</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
            {loading ? (
              <div className="col-span-full p-12 text-center">
                <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase">Đang tải dữ liệu...</p>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="col-span-full p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Building2 className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-base font-bold text-slate-600">Bạn chưa có tòa nhà nào.</p>
                <button onClick={openCreateModal} className="mt-4 text-brand-primary font-bold hover:underline">+ Thêm mới ngay</button>
              </div>
            ) : (
              filteredLocations.map((loc) => (
                <div key={loc.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group">
                  <div className="flex items-start gap-5">
                    {/* Icon section */}
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-brand-bg transition-colors">
                      <Building2 className="w-10 h-10 text-slate-300 group-hover:text-brand-primary transition-colors" />
                    </div>

                    {/* Content section */}
                    <div className="flex-1 min-w-0 pr-10 relative">
                      <div className="absolute right-0 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => openEditModal(loc)}
                           className="p-2 text-slate-300 hover:text-brand-primary hover:bg-brand-bg rounded-xl transition-all"
                         >
                           <Edit2 className="w-5 h-5" />
                         </button>
                         <button 
                           onClick={() => handleDelete(loc.id)}
                           className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                      </div>

                      <h3 className="text-[22px] font-black text-slate-900 mb-1 truncate">{loc.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                        <MapPin className="w-4 h-4" />
                        <span className="text-[13px] font-bold uppercase tracking-tight truncate">{loc.address}</span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="flex gap-8">
                           <div>
                             <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-1">Số tầng</p>
                             <p className="text-[18px] font-black text-slate-900">{loc.floors}</p>
                           </div>
                           <div>
                             <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-1">Tổng phòng</p>
                             <p className="text-[18px] font-black text-slate-900">{loc.rooms?.length || 0}</p>
                           </div>
                        </div>

                        <button className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                           Xem sơ đồ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Location Modal - REDESIGNED */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { 
          setIsModalOpen(false); 
          setEditingBuilding(null); 
          setSelectedType(""); 
          setSelectedStructure(""); 
          setCurrentStep(1);
          // Standardize services on reset
          setMeteredServices([{ id: 'dien', name: 'Điện', price: 4000, unit: 'kWh', icon: Zap }]);
          setFixedServices([
            { id: 'xe_may', name: 'Giữ xe máy', price: 100000, unit: 'chiếc', icon: Bike },
            { id: 'nuoc_may', name: 'Nước máy', price: 100000, unit: 'người', icon: Droplet },
            { id: 'phi_dv', name: 'Phí dịch vụ', price: 150000, unit: 'phòng', icon: Settings },
          ]);
        }} 
        title="" 
        size="lg"
        hideHeader
        noPadding
      >
         <form onSubmit={handleCreateOrUpdate} className="flex flex-col h-full bg-white max-h-[90vh]">
            {/* Header with Back Arrow and Close Button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 sticky top-0 bg-white z-20">
               <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                  <ChevronLeft className="w-6 h-6" />
               </button>
               <h2 className="text-[18px] font-bold text-brand-primary uppercase tracking-wide">
                  {selectedStructure || selectedType || 'Toà nhà'}
               </h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="p-6 space-y-8">
                  {/* Section: Thông tin */}
                  <div className="space-y-4">
                     <h3 className="text-[17px] font-bold text-slate-900 border-l-[3.5px] border-brand-primary pl-3">Thông tin</h3>
                     
                     <div className="space-y-4">
                        <div className="relative">
                           <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-medium text-slate-400 z-10">Loại hình cho thuê</label>
                           <select 
                              name="type" 
                              value={selectedType} 
                              onChange={(e) => setSelectedType(e.target.value)}
                              className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-brand-primary font-medium appearance-none"
                           >
                              {rentalTypes.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                           </select>
                        </div>

                        <div>
                           <div className="flex items-center justify-between mb-2">
                              <label className="text-[13px] font-bold text-slate-700">Địa chỉ <span className="text-rose-500">*</span></label>
                              <button 
                                 type="button" 
                                 onClick={handleGetCurrentLocation}
                                 className="flex items-center gap-1.5 text-[12px] font-bold text-brand-primary hover:opacity-80 disabled:opacity-50"
                                 disabled={locationLoading}
                              >
                                 {locationLoading ? 'Đang lấy vị trí...' : 'Chọn vị trí hiện tại'} <Navigation className="w-3.5 h-3.5" />
                              </button>
                           </div>
                           <input 
                              type="text" 
                              name="address" 
                              value={address} 
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Thành phố" 
                              className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-brand-primary font-medium mb-3 shadow-sm placeholder:text-slate-400" 
                              required 
                           />
                           <div className="flex justify-end">
                              <button 
                                 type="button" 
                                 onClick={handleOpenMapPicker}
                                 className="flex items-center gap-2 px-4 py-2 border border-dashed border-brand-primary text-brand-primary rounded-full text-[12px] font-bold hover:bg-brand-primary/5 disabled:opacity-50"
                                 disabled={locationLoading}
                              >
                                 {locationLoading ? (
                                   <>Đang tìm vị trí...</>
                                 ) : (
                                   <><MapIcon className="w-4 h-4" /> Chọn trên bản đồ</>
                                 )}
                              </button>
                           </div>
                        </div>

                        <div>
                           <input 
                              type="text" 
                              name="name" 
                              defaultValue={editingBuilding?.name || ""} 
                              placeholder={`Tên ${selectedType.toLowerCase() || 'toà nhà'} *`} 
                              className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-brand-primary font-medium shadow-sm" 
                              required 
                           />
                        </div>
                     </div>
                  </div>

                  {/* Section: Dịch vụ */}
                  <div className="space-y-5">
                     <h3 className="text-[17px] font-bold text-slate-900 border-l-[3.5px] border-brand-primary pl-3">Dịch vụ</h3>
                     
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <h4 className="text-[14px] font-bold text-slate-600 ml-1">Theo đồng hồ</h4>
                           {meteredServices.map((s) => (
                              <div key={s.id} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                    <s.icon className="w-5 h-5" />
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-[14px] font-bold text-slate-900">{s.name}</p>
                                    <p className="text-[13px] font-medium text-brand-primary">{s.price.toLocaleString('vi-VN')} đ / {s.unit}</p>
                                 </div>
                                 <button 
                                    type="button" 
                                    onClick={() => setMeteredServices(prev => prev.filter(item => item.id !== s.id))}
                                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                 >
                                    <X className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                        </div>

                        <div className="space-y-3">
                           <h4 className="text-[14px] font-bold text-slate-600 ml-1">Cố định theo tháng</h4>
                           {fixedServices.map((s) => (
                              <div key={s.id} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                    <s.icon className="w-5 h-5" />
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-[14px] font-bold text-slate-900">{s.name}</p>
                                    <p className="text-[13px] font-medium text-brand-primary">{s.price.toLocaleString('vi-VN')} đ / {s.unit}</p>
                                 </div>
                                 <button 
                                    type="button" 
                                    onClick={() => setFixedServices(prev => prev.filter(item => item.id !== s.id))}
                                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                 >
                                    <X className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                        </div>

                        <div className="flex justify-end pt-1">
                           <button type="button" className="flex items-center gap-1.5 px-5 py-2.5 border border-brand-primary text-brand-primary rounded-full text-[13px] font-bold hover:bg-brand-primary/5 transition-all active:scale-95 cursor-pointer" onClick={() => setIsAddServiceModalOpen(true)}>
                              <Plus className="w-4 h-4" /> Thêm dịch vụ
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Section: Tiện ích */}
                  <div className="space-y-5 pb-8">
                     <h3 className="text-[17px] font-bold text-slate-900 border-l-[3.5px] border-brand-primary pl-3">Tiện ích</h3>
                     
                     <div className="flex flex-wrap gap-2.5">
                        {allAmenities.map((a) => (
                           <button
                              key={a.id}
                              type="button"
                              onClick={() => setSelectedAmenities(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[13px] font-semibold transition-all shadow-sm ${
                                 selectedAmenities.includes(a.id) 
                                 ? 'bg-brand-primary border-brand-primary text-white' 
                                 : 'bg-white border-slate-100 text-slate-600 hover:border-brand-primary/30'
                              }`}
                           >
                              <a.icon className={`w-4 h-4 ${selectedAmenities.includes(a.id) ? 'text-white' : 'text-slate-400'}`} />
                              {a.label}
                           </button>
                        ))}
                        <button type="button" className="flex items-center gap-1.5 px-4 py-2.5 border border-brand-primary text-brand-primary rounded-full text-[13px] font-bold hover:bg-brand-primary/5 transition-all active:scale-95 cursor-pointer" onClick={() => setIsAddAmenityModalOpen(true)}>
                           <Plus className="w-4 h-4" /> Thêm tiện ích
                        </button>
                     </div>
                  </div>
                  {/* Section: Ký gửi */}
                  <div className="pt-6 border-t border-slate-100 space-y-5">
                     <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-100">
                        <div className="flex gap-4">
                           <div className="relative shrink-0">
                              <ShieldCheck className="w-12 h-12 text-brand-primary" strokeWidth={1.5} />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                 <Plus className="w-3 h-3 text-white" />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <h4 className="text-[16px] font-bold text-slate-900 leading-tight">Ký gửi phòng lên Nguồn Trọ Môi Giới</h4>
                              <ul className="space-y-1.5">
                                 {[
                                    'Cho môi giới biết bạn đang có phòng trống',
                                    'Môi giới có khách sẽ liên hệ bạn',
                                    'Tăng cơ hội lấp phòng nhanh'
                                 ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[13px] font-medium text-slate-500">
                                       <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                       {item}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                           <button type="button" className="py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
                              Để sau
                           </button>
                           <button type="button" className="py-2.5 px-4 bg-brand-primary text-white rounded-xl text-[13px] font-bold hover:bg-brand-dark shadow-sm transition-all">
                              Ký gửi ngay
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom Button */}
            <div className="p-6 border-t border-slate-50 bg-white">
               <button 
                  type="submit" 
                  className="w-full py-4 bg-brand-primary text-white rounded-full text-[16px] font-bold shadow-md hover:bg-brand-dark transition-all transform active:scale-[0.98]"
               >
                  Tiếp tục
               </button>
            </div>
         </form>
      </Modal>

      {/* Type Selection Modal */}
      <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title="Chọn loại hình cho thuê" size="md">
         <div className="p-0">
            <div className="flex flex-col">
               {rentalTypes.map((type) => (
                  <button
                     key={type.id}
                     onClick={() => handleSelectType(type.label)}
                     className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group text-left cursor-pointer"
                  >
                     <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                        <type.icon className="w-5 h-5" />
                     </div>
                     <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{type.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </Modal>

      {/* Structure Selection Modal */}
      <Modal isOpen={isStructureModalOpen} onClose={() => setIsStructureModalOpen(false)} title={`Cấu trúc ${selectedType}`} size="md">
         <div className="p-0">
            <div className="flex flex-col">
               {filteredStructureOptions.map((opt) => (
                  <button
                     key={opt.id}
                     onClick={() => handleSelectStructure(opt.label)}
                     className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group text-left cursor-pointer"
                  >
                     <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                        <StructureIcon className="w-5 h-5" />
                     </div>
                     <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </Modal>

      {/* Map Selection Modal */}
      <Modal 
        isOpen={isMapPickerOpen} 
        onClose={() => setIsMapPickerOpen(false)} 
        title="Chọn vị trí trên bản đồ" 
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
             {mapCoords && (
               <MapContainer center={mapCoords} zoom={15} className="h-full w-full">
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                  />
                  <LocationMarker position={mapCoords} setPosition={(pos) => setMapCoords(pos)} />
                  <MapSearch onSelect={(lat, lng, _addr) => {
                    setMapCoords([lat, lng]);
                  }} />
               </MapContainer>
             )}
             <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 shadow-sm border border-slate-200">
                Click lên bản đồ để chọn vị trí chính xác
             </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tọa độ đã chọn</p>
                  <span className="text-sm font-medium text-slate-500">
                    {mapCoords ? `${mapCoords[0].toFixed(6)}, ${mapCoords[1].toFixed(6)}` : 'Đang lấy vị trí...'}
                  </span>
                </div>
             </div>
             <button 
                type="button" 
                disabled={!mapCoords || locationLoading}
                onClick={async () => {
                  if (!mapCoords) return;
                  setLocationLoading(true);
                  try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapCoords[0]}&lon=${mapCoords[1]}&zoom=18&addressdetails=1`);
                    const data = await res.json();
                    handleMapSelect(mapCoords[0], mapCoords[1], data.display_name || `${mapCoords[0]}, ${mapCoords[1]}`);
                  } catch (err) {
                    handleMapSelect(mapCoords[0], mapCoords[1]);
                  } finally {
                    setLocationLoading(false);
                  }
                }}
                className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-brand-dark transition-all disabled:opacity-50"
             >
                {locationLoading ? 'Đang xử lý...' : 'Xác nhận'}
             </button>
          </div>
        </div>
      </Modal>

      {/* Add Service Modal - REDESIGNED */}
      <Modal 
         isOpen={isAddServiceModalOpen} 
         onClose={() => setIsAddServiceModalOpen(false)} 
         title="Thêm dịch vụ" 
         size="md"
      >
         <div className="p-6 space-y-6">
            {/* Nhóm dịch vụ */}
            <div className="space-y-2">
               <label className="text-[13px] font-medium text-slate-500 ml-1">Nhóm dịch vụ</label>
               <div className="relative">
                  <select 
                     value={newServiceType} 
                     onChange={(e) => setNewServiceType(e.target.value as any)}
                     className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-semibold text-slate-700 bg-white appearance-none cursor-pointer"
                  >
                     <option value="fixed">Cố định theo tháng</option>
                     <option value="metered">Theo đồng hồ</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
               </div>
            </div>

            {/* Chọn dịch vụ grid */}
            <div className="space-y-3">
               <label className="text-[13px] font-medium text-slate-500 ml-1">Chọn dịch vụ</label>
               <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-1 px-1">
                  {serviceTemplates.map((item) => (
                     <button
                        key={item.id}
                        type="button"
                        onClick={() => selectServiceTemplate(item)}
                        className={`flex flex-col items-center justify-center min-w-[85px] h-[85px] rounded-2xl border transition-all ${
                           selectedServiceTemplate === item.id 
                           ? 'bg-brand-primary border-brand-primary text-white shadow-md' 
                           : 'bg-[#f4f6f8] border-transparent text-slate-500 hover:bg-slate-100'
                        }`}
                     >
                        <item.icon className={`w-5 h-5 mb-2 ${selectedServiceTemplate === item.id ? 'text-white' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-bold text-center px-1 leading-tight">{item.name}</span>
                     </button>
                  ))}
               </div>
            </div>
            
            <div className="space-y-5">
               {/* Tên dịch vụ */}
               <div className="relative pt-1">
                  <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Tên dịch vụ *</label>
                  <input 
                     type="text" 
                     value={newServiceName} 
                     onChange={(e) => setNewServiceName(e.target.value)}
                     className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {/* Phí dịch vụ */}
                  <div className="relative pt-1">
                     <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Phí dịch vụ *</label>
                     <div className="relative">
                        <input 
                           type="text" 
                           value={newServicePrice} 
                           onChange={(e) => setNewServicePrice(formatCurrencyInput(e.target.value))}
                           className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800 pr-10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">đ</span>
                     </div>
                  </div>

                  {/* Đơn vị tính */}
                  <div className="relative pt-1">
                     <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-slate-400 z-10">Đơn vị tính *</label>
                     <input 
                        type="text" 
                        value={newServiceUnit} 
                        onChange={(e) => setNewServiceUnit(e.target.value)}
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-bold text-slate-800"
                     />
                  </div>
               </div>
            </div>

            <button 
               type="button"
               onClick={handleAddService}
               className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold mt-4 shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all transform active:scale-[0.98]"
            >
               Thêm
            </button>
         </div>
      </Modal>

      {/* Add Amenity Modal */}
      <Modal isOpen={isAddAmenityModalOpen} onClose={() => setIsAddAmenityModalOpen(false)} title="Thêm tiện ích mới" size="sm">
         <div className="p-6 space-y-4">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Tên tiện ích *</label>
               <input 
                  type="text" 
                  value={newAmenityName} 
                  onChange={(e) => setNewAmenityName(e.target.value)}
                  placeholder="Ví dụ: Hồ bơi, Gym..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-sm font-medium"
               />
            </div>
            <button 
               type="button"
               onClick={handleAddCustomAmenity}
               className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all active:scale-95"
            >
               Xác nhận thêm
            </button>
         </div>
      </Modal>

    </div>
  );
}
