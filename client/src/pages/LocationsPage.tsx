import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MapPin, Building2, Settings, Edit2, Eye, Trash2, X, Home, Map as MapIcon, Building, Bed, Briefcase, Zap, Droplet, Bike, ShieldCheck, User, Monitor, Trash, ChevronLeft, Navigation, Wifi, Car, Flame, ArrowUpCircle, Box, ChevronDown } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
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
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedStructure, setSelectedStructure] = useState("");
  const [_currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form states for services & amenities
  const [meteredServices, setMeteredServices] = useState([
    { id: 'dien', name: 'Điện', price: 4000, unit: 'kWh', icon: Zap },
  ]);
  const [fixedServices, setFixedServices] = useState([
    { id: 'xe_may', name: 'Giữ xe máy', price: 100000, unit: 'chiếc', icon: Bike },
    { id: 'nuoc_may', name: 'Nước máy', price: 100000, unit: 'người', icon: Droplet },
    { id: 'phi_dv', name: 'Phí dịch vụ', price: 150000, unit: 'phòng', icon: Settings },
  ]);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isAddAmenityModalOpen, setIsAddAmenityModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceUnit, setNewServiceUnit] = useState("phòng");
  const [newServiceType, setNewServiceType] = useState<"metered" | "fixed">("fixed");
  const [newAmenityName, setNewAmenityName] = useState("");
  
  const [address, setAddress] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCoords, setMapCoords] = useState<[number, number] | null>(null);

  // Home structure states
  const [numFloors, setNumFloors] = useState(1);
  const [numRoomsPerFloor, setNumRoomsPerFloor] = useState(1);
  const [hasGroundFloor, setHasGroundFloor] = useState(true);
  const [hasMezzanineFloor, setHasMezzanineFloor] = useState(false);
  const [roomNumberingType, setRoomNumberingType] = useState<"perFloor" | "continuous">("perFloor");
  const [isStructureSetupModalOpen, setIsStructureSetupModalOpen] = useState(false);
  const [isFloorSetupModalOpen, setIsFloorSetupModalOpen] = useState(false);
  const [isRoomSetupModalOpen, setIsRoomSetupModalOpen] = useState(false);
  
  const [floorsList, setFloorsList] = useState<{ id: string; name: string; numRooms: number }[]>([]);
  const [roomsList, setRoomsList] = useState<{ id: string; name: string; floorId: string }[]>([]);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<string | null>(null);
  const [currentQRBuilding, setCurrentQRBuilding] = useState<any>(null);

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
    
    // Validate required fields
    if (!address || !form.get("name")) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (editingBuilding) {
       // Save Info Only
       try {
         const data = {
           name: buildingName,
           address: address,
           rental_type: selectedType,
           structure_type: selectedStructure,
           amenities: selectedAmenities,
           metered_services: meteredServices,
           fixed_services: fixedServices,
           lat: mapCoords?.[0] || null,
           lng: mapCoords?.[1] || null,
           phone,
           website,
           description,
           structure_data: {
             numFloors,
             numRoomsPerFloor,
             hasGroundFloor,
             hasMezzanineFloor,
             roomNumberingType
           }
         };
         await api.put(`/api/buildings/${editingBuilding.id}`, data);
         setIsModalOpen(false);
         setEditingBuilding(null);
         fetchLocations();
       } catch (err: any) {
         console.error(err);
         alert(err.response?.data?.error || "Lỗi khi cập nhật thông tin");
       }
       return;
    }

    // New building: proceed to structure setup
    setIsModalOpen(false);
    setIsStructureSetupModalOpen(true);
  };

  const handleFinishStructureSetup = () => {
    // Generate Floors based on config
    const generatedFloors: { id: string; name: string; numRooms: number }[] = [];
    
    if (hasGroundFloor) {
      generatedFloors.push({ id: `floor_0`, name: 'Trệt', numRooms: numRoomsPerFloor });
    }
    if (hasMezzanineFloor) {
      generatedFloors.push({ id: `floor_m`, name: 'Lửng', numRooms: numRoomsPerFloor });
    }
    
    for (let i = 1; i <= numFloors; i++) {
       generatedFloors.push({ id: `floor_${i}`, name: `Tầng ${i}`, numRooms: numRoomsPerFloor });
    }
    
    setFloorsList(generatedFloors);
    setIsStructureSetupModalOpen(false);
    setIsFloorSetupModalOpen(true);
  };

  const handleFinishFloorSetup = () => {
    // Generate Rooms based on floors
    const generatedRooms: { id: string; name: string; floorId: string }[] = [];
    let roomCounter = 1;

    floorsList.forEach((floor, floorIdx) => {
      // Determine prefix/index for naming
      let floorNamePart = "";
      if (floor.name === 'Trệt') floorNamePart = "0";
      else if (floor.name === 'Lửng') floorNamePart = "L";
      else {
        // Extract number from "Tầng X"
        const match = floor.name.match(/\d+/);
        floorNamePart = match ? match[0] : (floorIdx + 1).toString();
      }

      for (let i = 1; i <= floor.numRooms; i++) {
        let roomName = "";
        if (roomNumberingType === 'perFloor') {
          roomName = `P${floorNamePart}${i < 10 ? '0' + i : i}`;
        } else {
          roomName = `P${roomCounter}`;
        }
        
        generatedRooms.push({
          id: `room_${floor.id}_${i}`,
          name: roomName,
          floorId: floor.id
        });
        roomCounter++;
      }
    });

    setRoomsList(generatedRooms);
    setIsFloorSetupModalOpen(false);
    setIsRoomSetupModalOpen(true);
  };

  const handleFinishRoomSetup = async () => {
     if (saving) return;
     setSaving(true);
     const data = {
      name: buildingName,
      address: address,
      rental_type: selectedType,
      structure_type: selectedStructure,
      amenities: selectedAmenities,
      metered_services: meteredServices,
      fixed_services: fixedServices,
      lat: mapCoords?.[0] || null,
      lng: mapCoords?.[1] || null,
      // Pass the fully custom structure
      floors: floorsList.length,
      phone,
      website,
      description,
      structure_data: {
        numFloors,
        numRoomsPerFloor,
        hasGroundFloor,
        hasMezzanineFloor,
        roomNumberingType
      },
      rooms: roomsList.map(r => ({
        name: r.name,
        floor_name: floorsList.find(f => f.id === r.floorId)?.name || ""
      }))
    };

    try {
      if (editingBuilding) {
        await api.put(`/api/buildings/${editingBuilding.id}`, data);
      } else {
        await api.post("/api/buildings", data);
      }
      setIsRoomSetupModalOpen(false);
      setEditingBuilding(null);
      setCurrentStep(1);
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Đã xảy ra lỗi");
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = async (id: string) => {
    const building = locations.find(l => l.id === id);
    const roomCount = building?.rooms?.length || 0;

    if (roomCount > 0) {
      alert(`Toà nhà "${building?.name}" đang có ${roomCount} phòng. Bạn không thể xoá toà nhà khi còn dữ liệu phòng/sơ đồ. Vui lòng xoá hết phòng trước.`);
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xoá toà nhà này?")) return;
    try {
      await api.delete(`/api/buildings/${id}`);
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Đã xảy ra lỗi khi xoá toà nhà.");
    }
  };

  const openCreateModal = () => {
    setEditingBuilding(null);
    setAddress("");
    setBuildingName("");
    setPhone("");
    setWebsite("");
    setDescription("");
    setMapCoords(null);
    setSelectedAmenities([]);
    setSelectedType("");
    setSelectedStructure("");
    setNumFloors(1);
    setNumRoomsPerFloor(1);
    setHasGroundFloor(true);
    setHasMezzanineFloor(false);
    setRoomNumberingType("perFloor");
    // Reset to standard defaults for new building
    setMeteredServices([{ id: 'dien', name: 'Điện', price: 4000, unit: 'kWh', icon: Zap }]);
    setFixedServices([
      { id: 'xe_may', name: 'Giữ xe máy', price: 100000, unit: 'chiếc', icon: Bike },
      { id: 'nuoc_may', name: 'Nước máy', price: 100000, unit: 'người', icon: Droplet },
      { id: 'phi_dv', name: 'Phí dịch vụ', price: 150000, unit: 'phòng', icon: Settings },
    ]);
    setIsTypeModalOpen(true);
  };

  /* @ts-ignore */
/* @ts-ignore */
const _handleViewDiagram = (b: any) => {
    setIsViewMode(true);
    // Populate structure info
    if (b.rooms && b.rooms.length > 0) {
      const uniqueFloorNames: string[] = [];
      b.rooms.forEach((r: any) => {
        const fn = r.floor_name || "Trệt";
        if (!uniqueFloorNames.includes(fn)) uniqueFloorNames.push(fn);
      });

      const mappedFloors = uniqueFloorNames.map((name, idx) => ({
        id: `floor_view_${idx}`,
        name: name,
        numRooms: b.rooms.filter((r: any) => (r.floor_name || "Trệt") === name).length
      }));
      setFloorsList(mappedFloors);
      
      const mappedRooms = b.rooms.map((r: any, idx: number) => ({
        id: r.id || `room_view_${idx}`,
        name: r.room_number || r.name || "",
        floorId: mappedFloors.find(f => f.name === (r.floor_name || "Trệt"))?.id || mappedFloors[0].id
      }));
      setRoomsList(mappedRooms);
      setIsRoomSetupModalOpen(true);
    } else {
      alert("Tòa nhà này chưa có dữ liệu sơ đồ phòng.");
    }
  };

  /* @ts-ignore */
/* @ts-ignore */
const _handleShowQR = async (b: any) => {
    setCurrentQRBuilding(b);
    try {
      const { data, error } = await api.get<{ qr: any; url: string }>(`/api/qr/building/${b.id}`);
      
      if (error || !data || !data.qr) {
        // Generate new if not exists
        const { data: genData, error: genError } = await api.post<{ qr: any; url: string }>("/api/qr/generate", { building_id: b.id });
        if (genError || !genData) throw new Error(genError || "Failed to generate QR");
        setCurrentQRCode(genData.qr.code);
      } else {
        setCurrentQRCode(data.qr.code);
      }
      setIsQRModalOpen(true);
    } catch (err: any) {
      console.error(err);
      alert("Không thể tạo mã QR cho tòa nhà này.");
    }
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
    setBuildingName(b.name || "");
    setPhone(b.phone || "");
    setWebsite(b.website || "");
    setDescription(b.description || "");
    if (b.lat && b.lng) {
      setMapCoords([b.lat, b.lng]);
    } else {
      setMapCoords(null);
    }
    setSelectedAmenities(b.amenities || []);
    setSelectedType(b.rental_type || "");
    setSelectedStructure(b.structure_type || "");
    
    // Restore detailed services with robust icon mapping
    const findIcon = (name: string, id?: string) => {
      const template = serviceTemplates.find(t => t.name === name || t.id === id);
      if (template) return template.icon;
      if (name?.toLowerCase().includes('điện')) return Zap;
      if (name?.toLowerCase().includes('nước')) return Droplet;
      if (name?.toLowerCase().includes('xe')) return Bike;
      return Settings;
    };

    if (b.metered_services && b.metered_services.length > 0) {
      setMeteredServices(b.metered_services.map((s: any) => ({
        ...s,
        icon: findIcon(s.name, s.id)
      })));
    } else {
      setMeteredServices([{ id: 'dien', name: 'Điện', price: 4000, unit: 'kWh', icon: Zap }]);
    }

    if (b.fixed_services && b.fixed_services.length > 0) {
      setFixedServices(b.fixed_services.map((s: any) => ({
        ...s,
        icon: findIcon(s.name, s.id)
      })));
    } else {
      setFixedServices([
        { id: 'xe_may', name: 'Giữ xe máy', price: 100000, unit: 'chiếc', icon: Bike },
        { id: 'nuoc_may', name: 'Nước máy', price: 100000, unit: 'người', icon: Droplet },
        { id: 'phi_dv', name: 'Phí dịch vụ', price: 150000, unit: 'phòng', icon: Settings },
      ]);
    }

    setIsModalOpen(true);

    // Populate floors and rooms for editing
    if (b.rooms && b.rooms.length > 0) {
      const uniqueFloorNames: string[] = [];
      b.rooms.forEach((r: any) => {
        const fn = r.floor_name || "Trệt";
        if (!uniqueFloorNames.includes(fn)) uniqueFloorNames.push(fn);
      });

      const mappedFloors = uniqueFloorNames.map((name, idx) => ({
        id: `floor_edit_${idx}`,
        name: name,
        numRooms: b.rooms.filter((r: any) => (r.floor_name || "Trệt") === name).length
      }));
      setFloorsList(mappedFloors);
      
      const mappedRooms = b.rooms.map((r: any, idx: number) => ({
        id: `room_edit_${idx}`,
        name: r.room_number || r.name || "",
        floorId: mappedFloors.find(f => f.name === (r.floor_name || "Trệt"))?.id || mappedFloors[0].id
      }));
      setRoomsList(mappedRooms);
    } else {
      setFloorsList([]);
      setRoomsList([]);
    }

    // Restore structure data if exists
    if (b.structure_data) {
      if (b.structure_data.numFloors !== undefined) setNumFloors(b.structure_data.numFloors);
      if (b.structure_data.numRoomsPerFloor !== undefined) setNumRoomsPerFloor(b.structure_data.numRoomsPerFloor);
      if (b.structure_data.hasGroundFloor !== undefined) setHasGroundFloor(b.structure_data.hasGroundFloor);
      if (b.structure_data.hasMezzanineFloor !== undefined) setHasMezzanineFloor(b.structure_data.hasMezzanineFloor);
      if (b.structure_data.roomNumberingType !== undefined) setRoomNumberingType(b.structure_data.roomNumberingType);
    }
  };

  /* @ts-ignore */
/* @ts-ignore */
const _openStructureEditModal = (b: any) => {
    setEditingBuilding(b);
    setSelectedType(b.rental_type || "");
    setSelectedStructure(b.structure_type || "");
    
    // Populate floors and rooms for editing
    if (b.rooms && b.rooms.length > 0) {
      const uniqueFloorNames: string[] = [];
      b.rooms.forEach((r: any) => {
        const fn = r.floor_name || "Trệt";
        if (!uniqueFloorNames.includes(fn)) uniqueFloorNames.push(fn);
      });

      const mappedFloors = uniqueFloorNames.map((name, idx) => ({
        id: `floor_edit_${idx}`,
        name: name,
        numRooms: b.rooms.filter((r: any) => (r.floor_name || "Trệt") === name).length
      }));
      setFloorsList(mappedFloors);
      
      const mappedRooms = b.rooms.map((r: any, idx: number) => ({
        id: r.id || `room_edit_${idx}`,
        name: r.room_number || r.name || "",
        floorId: mappedFloors.find(f => f.name === (r.floor_name || "Trệt"))?.id || mappedFloors[0].id
      }));
      setRoomsList(mappedRooms);
    } else {
      setFloorsList([]);
      setRoomsList([]);
    }

    // Restore structure data if exists
    if (b.structure_data) {
      if (b.structure_data.numFloors !== undefined) setNumFloors(b.structure_data.numFloors);
      if (b.structure_data.numRoomsPerFloor !== undefined) setNumRoomsPerFloor(b.structure_data.numRoomsPerFloor);
      if (b.structure_data.hasGroundFloor !== undefined) setHasGroundFloor(b.structure_data.hasGroundFloor);
      if (b.structure_data.hasMezzanineFloor !== undefined) setHasMezzanineFloor(b.structure_data.hasMezzanineFloor);
      if (b.structure_data.roomNumberingType !== undefined) setRoomNumberingType(b.structure_data.roomNumberingType);
    }
    
    setIsViewMode(false);
    setIsRoomSetupModalOpen(true);
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-[#f8f9fa]">
        <div className="max-w-none space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            <h2 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">Danh sách toà nhà</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-5 text-[12px] font-bold text-slate-700 min-w-[200px]">Tên toà nhà</th>
                  <th className="px-6 py-5 text-[12px] font-bold text-slate-700">Địa chỉ</th>
                  <th className="px-6 py-5 text-[12px] font-bold text-slate-700 text-center">Số điện thoại</th>
                  <th className="px-6 py-5 text-[12px] font-bold text-slate-700 w-24 text-center">Số tầng</th>
                  <th className="px-6 py-5 text-[12px] font-bold text-slate-700 w-24 text-center">Số phòng</th>
                  <th className="px-6 py-5 text-[12px] font-bold text-slate-700 w-36 text-center">Trạng thái</th>
                  <th className="px-6 py-5 w-24 text-center"><Settings className="w-4 h-4 text-slate-400 mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-[12px] font-bold text-slate-400 uppercase">Đang tải...</p>
                    </td>
                  </tr>
                ) : filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <Building2 className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-500">Bạn chưa có tòa nhà nào.</p>
                      <button onClick={openCreateModal} className="mt-2 text-brand-primary font-bold hover:underline text-sm">+ Thêm mới</button>
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-slate-50 border-b border-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6]">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className="text-[13px] font-semibold text-slate-700 line-clamp-1">{loc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-medium text-slate-600 line-clamp-1">{loc.address}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-[13px] font-medium text-slate-600">{loc.phone || '0906417577'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[13px] font-semibold text-slate-600">{loc.floors || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[13px] font-semibold text-slate-600">{loc.rooms?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[11px] font-semibold whitespace-nowrap">
                            Hoạt động
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                         <button onClick={() => navigate(`/locations/${loc.id}`)} className="p-1.5 text-slate-400 hover:text-[#14B8A6] rounded transition-colors" title="Chi tiết tòa nhà">
                            <Eye className="w-4 h-4" />
                         </button>
                         <button onClick={() => openEditModal(loc)} className="p-1.5 text-slate-400 hover:text-[#14B8A6] rounded transition-colors" title="Sửa cấu trúc">
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(loc.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                         </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                              value={buildingName} 
                              onChange={(e) => setBuildingName(e.target.value)}
                              placeholder={`Tên ${selectedType.toLowerCase() || 'toà nhà'} *`} 
                              className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-brand-primary font-medium shadow-sm" 
                              required 
                           />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[14px] font-bold text-slate-700 ml-1">Số điện thoại</label>
                              <div className="relative group">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
                                    <User className="w-5 h-5" />
                                 </div>
                                 <input 
                                    type="text" 
                                    placeholder="Nhập số điện thoại liên hệ"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-sm pl-11 h-14"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[14px] font-bold text-slate-700 ml-1">Website (nếu có)</label>
                              <div className="relative group">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
                                    <Monitor className="w-5 h-5" />
                                 </div>
                                 <input 
                                    type="text" 
                                    placeholder="https://..."
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-sm pl-11 h-14"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[14px] font-bold text-slate-700 ml-1">Mô tả</label>
                           <textarea 
                              placeholder="Nhập mô tả về toà nhà..."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-sm h-24"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Section: Dịch vụ - ĐÃ ẨN THEO YÊU CẦU FPHOST */}


                  {/* Section: Tiện ích - ĐÃ ẨN THEO YÊU CẦU FPHOST */}

                  {/* Section: Ký gửi */}
                  <div className="pt-6 border-t border-slate-100 space-y-5">
                     <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-100">
                        <div className="flex gap-4">
                           <div className="relative shrink-0">
                              <ShieldCheck className="w-12 h-12 text-[#14B8A6]" strokeWidth={1.5} />
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
                        <div className="mt-5 space-y-3">
                           <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mức hoa hồng cho môi giới (%)</label>
                              <div className="flex gap-2">
                                <input type="number" min="0" max="100" placeholder="Vd: 50" className="flex-1 px-4 py-2.5 border border-slate-200 focus:border-[#14B8A6] outline-none rounded-xl text-sm font-bold shadow-sm" />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-3 pt-1">
                              <button type="button" onClick={() => alert("Đã bỏ qua ký gửi")} className="py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
                                 Để sau
                              </button>
                              <button type="submit" onClick={() => alert("Đã lưu thông tin Ký gửi Môi giới! Đang chuyển sang bước kế tiếp...")} className="py-2.5 px-4 bg-[#14B8A6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0F766E] shadow-sm transition-all">
                                 Ký gửi ngay
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom Button */}
            <div className="p-6 border-t border-slate-50 bg-white flex gap-3">
               {editingBuilding && (
                 <button 
                    type="button"
                    onClick={async () => {
                      if (!address || !buildingName) {
                        alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
                        return;
                      }
                      
                      const data = {
                        name: buildingName,
                        address: address,
                        rental_type: selectedType,
                        structure_type: selectedStructure,
                        amenities: selectedAmenities,
                        metered_services: meteredServices,
                        fixed_services: fixedServices,
                        lat: mapCoords?.[0] || null,
                        lng: mapCoords?.[1] || null,
                        phone,
                        website,
                        description,
                        structure_data: {
                          numFloors,
                          numRoomsPerFloor,
                          hasGroundFloor,
                          hasMezzanineFloor,
                          roomNumberingType
                        }
                      };

                      try {
                        await api.put(`/api/buildings/${editingBuilding.id}`, data);
                        setIsModalOpen(false);
                        setEditingBuilding(null);
                        fetchLocations();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.error || "Đã xảy ra lỗi");
                      }
                    }}
                    className="flex-1 py-4 border border-brand-primary text-brand-primary rounded-full text-[16px] font-bold hover:bg-brand-primary/5 transition-all"
                 >
                    Lưu thông tin
                 </button>
               )}
               <button 
                  type="submit" 
                  className={`${editingBuilding ? 'flex-1' : 'w-full'} py-4 bg-brand-primary text-white rounded-full text-[16px] font-bold shadow-md hover:bg-brand-dark transition-all transform active:scale-[0.98]`}
               >
                  {editingBuilding ? 'Sửa cấu trúc' : 'Tiếp tục'}
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

      {/* Structure Setup Modal (New) */}
      <Modal 
        isOpen={isStructureSetupModalOpen} 
        onClose={() => setIsStructureSetupModalOpen(false)} 
        title="Tạo cấu trúc nhà" 
        size="md"
        hideHeader
      >
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 sticky top-0 bg-white z-10">
            <h2 className="text-[18px] font-bold text-slate-800">Tạo cấu trúc nhà</h2>
            <button onClick={() => setIsStructureSetupModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Sổ tầng */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-bold text-slate-800">Số tầng <span className="text-rose-500">*</span></p>
                <p className="text-[12px] text-slate-400">(Tối đa 10 tầng)</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setNumFloors(Math.max(1, numFloors - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xl -mt-0.5">−</span>
                </button>
                <span className="w-8 text-center text-lg font-bold text-slate-800 border-b border-slate-200 pb-0.5">{numFloors}</span>
                <button 
                  type="button"
                  onClick={() => setNumFloors(Math.min(10, numFloors + 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Số phòng mỗi tầng */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-bold text-slate-800">Số phòng mỗi tầng <span className="text-rose-500">*</span></p>
                <p className="text-[12px] text-slate-400">(Tối đa 50 phòng)</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setNumRoomsPerFloor(Math.max(1, numRoomsPerFloor - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xl -mt-0.5">−</span>
                </button>
                <span className="w-8 text-center text-lg font-bold text-slate-800 border-b border-slate-200 pb-0.5">{numRoomsPerFloor}</span>
                <button 
                  type="button"
                  onClick={() => setNumRoomsPerFloor(Math.min(50, numRoomsPerFloor + 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-1">
                  <input 
                    type="checkbox" 
                    checked={hasGroundFloor} 
                    onChange={(e) => setHasGroundFloor(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${hasGroundFloor ? 'bg-brand-primary border-brand-primary' : 'border-slate-300 group-hover:border-brand-primary/50'}`}>
                    {hasGroundFloor && <X className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Nhà có tầng Trệt</p>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed">Ví dụ: Trệt, Tầng 1, Tầng 2, Tầng 3....</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-1">
                  <input 
                    type="checkbox" 
                    checked={hasMezzanineFloor} 
                    onChange={(e) => setHasMezzanineFloor(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${hasMezzanineFloor ? 'bg-brand-primary border-brand-primary' : 'border-slate-300 group-hover:border-brand-primary/50'}`}>
                    {hasMezzanineFloor && <X className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Nhà có tầng Lửng</p>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed">Ví dụ: Lửng, Tầng 1, Tầng 2, Tầng 3....</p>
                </div>
              </label>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-[15px] font-bold text-slate-800 mb-4">Đánh số phòng</h3>
              <div className="space-y-5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-1.5 flex-shrink-0">
                    <input 
                      type="radio" 
                      name="numbering" 
                      checked={roomNumberingType === 'perFloor'} 
                      onChange={() => setRoomNumberingType('perFloor')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${roomNumberingType === 'perFloor' ? 'border-brand-primary' : 'border-slate-300 group-hover:border-brand-primary/50'}`}>
                      {roomNumberingType === 'perFloor' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-800">Tăng dần theo tầng</p>
                    <p className="text-[12px] text-slate-400 font-medium leading-relaxed">Ví dụ: P101, P201, P301, P401...</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-1.5 flex-shrink-0">
                    <input 
                      type="radio" 
                      name="numbering" 
                      checked={roomNumberingType === 'continuous'} 
                      onChange={() => setRoomNumberingType('continuous')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${roomNumberingType === 'continuous' ? 'border-brand-primary' : 'border-slate-300 group-hover:border-brand-primary/50'}`}>
                      {roomNumberingType === 'continuous' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-800">Tăng dần đều</p>
                    <p className="text-[12px] text-slate-400 font-medium leading-relaxed">Ví dụ: P1, P2, P3, P4, P5...</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                type="button"
                onClick={() => {
                  setIsStructureSetupModalOpen(false);
                  setIsModalOpen(true);
                }}
                className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-[20px] text-[16px] font-bold hover:bg-slate-50 transition-all"
              >
                Quay lại
              </button>
              <button 
                type="button"
                onClick={handleFinishStructureSetup}
                className="flex-[2] py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[20px] text-[16px] font-bold shadow-md transition-all transform active:scale-[0.98]"
              >
                Tạo cấu trúc
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Floor Setup Modal */}
      <Modal 
        isOpen={isFloorSetupModalOpen} 
        onClose={() => setIsFloorSetupModalOpen(false)} 
        title="Tạo tầng" 
        size="md"
        hideHeader
      >
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 sticky top-0 bg-white z-10">
            <h2 className="text-[18px] font-bold text-slate-800">Tạo tầng</h2>
            <button onClick={() => setIsFloorSetupModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-[14px] text-slate-500 font-medium mb-2">Bạn có thể chỉnh sửa, thêm hoặc xóa tầng:</p>
            {floorsList.map((floor, idx) => (
              <div key={floor.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 font-bold text-sm shadow-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={floor.name} 
                    onChange={(e) => {
                      const newFloors = [...floorsList];
                      newFloors[idx].name = e.target.value;
                      setFloorsList(newFloors);
                    }}
                    className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-800 p-0"
                    placeholder="Tên tầng"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{floor.numRooms} phòng</p>
                    <div className="flex items-center gap-1 ml-4 scale-75 origin-left">
                       <button onClick={() => {
                          const newFloors = [...floorsList];
                          newFloors[idx].numRooms = Math.max(1, newFloors[idx].numRooms - 1);
                          setFloorsList(newFloors);
                       }} className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-primary">-</button>
                       <span className="text-[11px] font-bold text-slate-600 w-4 text-center">{floor.numRooms}</span>
                       <button onClick={() => {
                          const newFloors = [...floorsList];
                          newFloors[idx].numRooms = Math.min(50, newFloors[idx].numRooms + 1);
                          setFloorsList(newFloors);
                       }} className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-primary">+</button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setFloorsList(floorsList.filter((_, i) => i !== idx))}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => {
                const lastNum = floorsList.length > 0 ? parseInt(floorsList[floorsList.length-1].name.match(/\d+/)?.[0] || floorsList.length.toString()) : 0;
                setFloorsList([...floorsList, { id: `floor_manual_${Date.now()}`, name: `Tầng ${lastNum + 1}`, numRooms: numRoomsPerFloor }]);
              }}
              className="w-full py-3 border border-dashed border-slate-200 rounded-2xl text-[13px] font-bold text-slate-400 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm tầng mới
            </button>
          </div>

          <div className="p-6 border-t border-slate-50 bg-white flex gap-3">
            <button 
              onClick={() => {
                setIsFloorSetupModalOpen(false);
                setIsStructureSetupModalOpen(true);
              }}
              className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-[20px] text-[16px] font-bold hover:bg-slate-50 transition-all"
            >
              Quay lại
            </button>
            <button 
              onClick={handleFinishFloorSetup}
              className="flex-[2] py-4 bg-brand-primary text-white rounded-[20px] text-[16px] font-bold shadow-md transition-all transform active:scale-[0.98]"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </Modal>

      {/* Room Setup Modal */}
      <Modal 
        isOpen={isRoomSetupModalOpen} 
        onClose={() => {
          setIsRoomSetupModalOpen(false);
          setIsViewMode(false);
        }} 
        title={isViewMode ? "Sơ đồ phòng" : "Tạo phòng"} 
        size="lg"
        hideHeader
      >
        <div className="flex flex-col h-full bg-white max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 sticky top-0 bg-white z-10">
            <h2 className="text-[18px] font-bold text-slate-800">{isViewMode ? `Sơ đồ: ${floorsList.length} tầng` : "Tạo phòng của các tầng"}</h2>
            <button onClick={() => {
              setIsRoomSetupModalOpen(false);
              setIsViewMode(false);
            }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {floorsList.map((floor) => (
              <div key={floor.id} className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-6 w-1 rounded-full bg-brand-primary" />
                      <h3 className="text-[16px] font-black text-slate-900">{floor.name}</h3>
                   </div>
                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{roomsList.filter(r => r.floorId === floor.id).length} phòng</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {roomsList.filter(r => r.floorId === floor.id).map((room) => (
                    <div key={room.id} className="relative group">
                      <input 
                        type="text" 
                        value={room.name}
                        readOnly={isViewMode}
                        onChange={(e) => {
                          if (isViewMode) return;
                          const newRooms = [...roomsList];
                          const roomIdx = roomsList.findIndex(r => r.id === room.id);
                          newRooms[roomIdx].name = e.target.value;
                          setRoomsList(newRooms);
                        }}
                        className={`w-full px-3 py-3 border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-700 focus:outline-none transition-all shadow-sm ${isViewMode ? 'bg-slate-50 cursor-default' : 'bg-slate-50/50 hover:bg-white focus:border-brand-primary pr-8'}`}
                      />
                      {isViewMode && (
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm shadow-md">
                          <Link 
                            to={`/create-listing?building_id=${editingBuilding?.id || 'new'}&room_id=${room.id}`}
                            className="text-white text-[11px] font-bold bg-[#14B8A6] px-3 py-1.5 rounded-full hover:bg-[#0F766E] transition-all transform hover:scale-105 shadow-xl whitespace-nowrap"
                          >
                            Cập nhật phòng
                          </Link>
                        </div>
                      )}
                      {!isViewMode && (
                        <button 
                          onClick={() => setRoomsList(roomsList.filter(r => r.id !== room.id))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isViewMode && (
                    <button 
                      type="button"
                      onClick={() => {
                        const newRoomId = `room_${floor.id}_manual_${Date.now()}`;
                        const roomsInThisFloor = roomsList.filter(r => r.floorId === floor.id);
                        const lastRoomInFloor = roomsInThisFloor[roomsInThisFloor.length - 1];
                        let nextName = "P";
                        if (lastRoomInFloor) {
                           const match = lastRoomInFloor.name.match(/\d+/);
                           if (match) {
                              const lastNum = parseInt(match[0], 10);
                              nextName = `P${lastNum + 1}`;
                           } else {
                              nextName = `${lastRoomInFloor.name} (copy)`;
                           }
                        }
                        setRoomsList([...roomsList, { id: newRoomId, name: nextName, floorId: floor.id }]);
                      }}
                      className="flex items-center justify-center px-3 py-3 border border-dashed border-slate-200 rounded-xl text-slate-300 hover:text-brand-primary hover:border-brand-primary transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-slate-50 bg-white flex gap-3">
            {isViewMode ? (
              <button 
                onClick={() => {
                   setIsRoomSetupModalOpen(false);
                   setIsViewMode(false);
                }}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-[20px] text-[16px] font-bold hover:bg-slate-200 transition-all"
              >
                Đóng sơ đồ
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setIsRoomSetupModalOpen(false);
                    setIsFloorSetupModalOpen(true);
                  }}
                  className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-[20px] text-[16px] font-bold hover:bg-slate-50 transition-all"
                >
                  Quay lại
                </button>
                <button 
                  onClick={handleFinishRoomSetup}
                  disabled={saving}
                  className={`flex-[2] py-4 bg-brand-primary text-white rounded-[20px] text-[16px] font-bold shadow-md transition-all transform active:scale-[0.98] ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Đang tạo...' : (editingBuilding ? 'Cập nhật tòa nhà' : 'Hoàn tất & Tạo tòa nhà')}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* QR Display Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="Mã QR Tòa nhà"
        size="md"
      >
        <div className="flex flex-col items-center p-8 text-center space-y-6">
          <div className="bg-white p-6 rounded-[40px] shadow-2xl shadow-indigo-100 border-4 border-slate-50 relative overflow-hidden">
             <div className="absolute inset-0 bg-indigo-50/30 blur-2xl -z-10" />
             <QRCodeCanvas 
                value={`${window.location.origin}/qr/${currentQRCode}`}
                size={220}
                level="H"
                includeMargin
                imageSettings={{
                  src: "/logo.jpg",
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
             />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{currentQRBuilding?.name}</h3>
            <p className="text-sm font-bold text-slate-400 max-w-xs">{currentQRBuilding?.address}</p>
          </div>

          <div className="w-full pt-4 space-y-3">
             <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-3xl text-[13px] font-black uppercase tracking-widest border border-emerald-100 italic">
                Khách quét mã này để xem trạng thái phòng trống thời gian thực
             </div>

             <button 
                onClick={() => {
                   const canvas = document.querySelector('canvas');
                   if (canvas) {
                      const url = canvas.toDataURL("image/png");
                      const link = document.createElement('a');
                      link.download = `QR_${currentQRBuilding?.name}.png`;
                      link.href = url;
                      link.click();
                   }
                }}
                className="w-full py-4 bg-brand-primary text-white rounded-[20px] text-[16px] font-bold hover:bg-brand-dark transition-all shadow-lg cursor-pointer"
             >
                Tải mã QR
             </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
