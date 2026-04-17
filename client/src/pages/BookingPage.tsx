import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Globe,
  List,
  Calendar as CalendarIcon,
  ChevronDown,
  Users,
  Search,
  Check
} from "lucide-react";
import { api } from "../lib/api";
import type { BuildingWithRooms, RoomStatus } from "../../../shared/types";
import { useBuilding } from "../contexts/BuildingContext";
import Modal from "../components/modals/Modal";
import BookingForm from "../components/modals/BookingForm";

const STATUS = {
  available: {
    label: "Đang trống",
    colorClass: "bg-emerald-500",
    borderColorClass: "border-emerald-500",
  },
  reserved: {
    label: "Đã cọc",
    colorClass: "bg-amber-500",
    borderColorClass: "border-amber-500",
  },
  occupied: {
    label: "Đang sử dụng",
    colorClass: "bg-brand-primary",
    borderColorClass: "border-brand-primary",
  },
  maintenance: {
    label: "Đang bảo trì",
    colorClass: "bg-slate-300",
    borderColorClass: "border-slate-300",
  },
} as const;

interface Room {
  id: string;
  room_number: string;
  floor: number;
  status: RoomStatus;
  current_occupants: number;
  max_occupants: number;
  building_id: string;
}

interface RoomWithBuilding extends Room {
  building_name: string;
}

interface BuildingSection {
  id: string;
  name: string;
  rooms: RoomWithBuilding[];
  byFloor: Record<number, RoomWithBuilding[]>;
  sortedFloors: number[];
}

const BookingPage = () => {
  const { selectedBuildingId } = useBuilding();

  const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [selectedFloor, setSelectedFloor] = useState<number | "all">("all");
  
  // New Filter States
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isRoomFilterOpen, setIsRoomFilterOpen] = useState(false);
  const [roomFilterSearch, setRoomFilterSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<RoomStatus[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsRoomFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    const params = selectedBuildingId ? `?building_id=${selectedBuildingId}` : "";
    const { data } = await api.get<{ buildings: BuildingWithRooms[] }>(`/api/buildings${params}`);
    if (data) setBuildings(data.buildings);
    setLoading(false);
  }, [selectedBuildingId]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const handleOpenBooking = (room: Room) => {
    setActiveRoom(room);
    setIsModalOpen(true);
  };

  const handleCreateBooking = async (formData: any) => {
    if (!activeRoom) return;
    
    const parseCurrency = (val: string | number) => {
      if (!val) return 0;
      return parseInt(String(val).replace(/,/g, ""), 10) || 0;
    };

    const payload = {
      customer_name: formData.customerName,
      customer_phone: formData.phone,
      customer_email: formData.email,
      check_in_date: formData.checkInDate,
      expected_check_out: formData.expectedCheckOut,
      deposit_amount: parseCurrency(formData.depositAmount),
      rent_amount: parseCurrency(formData.rentAmount),
      room_id: activeRoom.id,
      building_id: activeRoom.building_id,
      notes: formData.notes,
      
      // New extended fields (SmartOS)
      identity_number: formData.identityNumber,
      customer_zalo: formData.zalo,
      guest_count: parseInt(String(formData.guestCount), 10) || 1,
      rent_cycle: formData.rentCycle,
      payment_cycle: formData.paymentCycle,
      payment_method: formData.paymentMethod,
      transaction_date: formData.transactionDate
    };

    const { error } = await api.post("/api/reservations", payload);
    if (!error) {
      setIsModalOpen(false);
      fetchBuildings(); // Refresh to show room status if changed
    } else {
      alert(error);
    }
  };

  const isAllBuildings = !selectedBuildingId;
  const scopedBuildings = useMemo(
    () =>
      selectedBuildingId ?
        buildings.filter((b) => b.id === selectedBuildingId)
      : buildings,
    [buildings, selectedBuildingId],
  );
  const allRooms: RoomWithBuilding[] = useMemo(
    () =>
      scopedBuildings.flatMap((building) =>
        (building.rooms ?? []).map((room) => ({
          ...room,
          building_id: room.building_id || building.id,
          building_name: building.name,
        })),
      ),
    [scopedBuildings],
  );
  const floors = [...new Set(allRooms.map((r) => r.floor || 1))].sort((a, b) => a - b);
  const buildingSections = useMemo<BuildingSection[]>(
    () =>
      scopedBuildings
        .map((building) => {
          const buildingRooms: RoomWithBuilding[] = (building.rooms ?? []).map((room) => ({
            ...room,
            building_id: room.building_id || building.id,
            building_name: building.name,
          }));
          const filteredRooms = buildingRooms.filter((room) => {
            if (selectedFloor !== "all" && (room.floor || 1) !== selectedFloor) return false;
            if (selectedRooms.length > 0 && !selectedRooms.includes(room.id)) return false;
            if (activeStatuses.length > 0 && !activeStatuses.includes(room.status as RoomStatus)) return false;
            return true;
          });

          const byFloor: Record<number, RoomWithBuilding[]> = {};
          filteredRooms.forEach((room) => {
            const floor = room.floor || 1;
            if (!byFloor[floor]) byFloor[floor] = [];
            byFloor[floor].push(room);
          });

          return {
            id: building.id,
            name: building.name,
            rooms: filteredRooms,
            byFloor,
            sortedFloors: Object.keys(byFloor)
              .map(Number)
              .sort((a, b) => a - b),
          };
        })
        .filter((section) => section.rooms.length > 0),
    [scopedBuildings, selectedFloor, selectedRooms, activeStatuses],
  );

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold">Danh sách phòng</h1>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 bg-slate-100 shadow-sm transition-all active:scale-95">
            <Globe className="w-4 h-4 text-slate-700" />
          </button>
          <button className="p-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button className="p-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col gap-3 px-6 py-3 bg-slate-50/30 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <label className="relative flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white min-w-[150px] cursor-pointer hover:border-brand-primary transition-all font-medium">
            <span className="text-slate-800">{formatDate(selectedDate)}</span>
            <CalendarDays className="w-4 h-4 ml-auto text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </label>

          <div className="relative border border-slate-200 rounded-xl bg-white min-w-[150px] hover:border-brand-primary transition-all">
            <select
              value={selectedFloor}
              onChange={(e) =>
                setSelectedFloor(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="w-full appearance-none bg-transparent px-3 py-2 text-sm text-slate-600 focus:outline-none font-medium cursor-pointer"
            >
              <option value="all">Tất cả tầng</option>
              {floors.map((f) => (
                <option key={f} value={f}>
                  Tầng {f}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative z-20" ref={filterRef}>
            <button
              onClick={() => setIsRoomFilterOpen(!isRoomFilterOpen)}
              className="flex items-center justify-between w-[200px] px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white hover:border-brand-primary transition-all font-medium"
            >
              <span className="truncate">
                {selectedRooms.length === 0 ? "Chọn phòng" : `Đã chọn (${selectedRooms.length})`}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            <AnimatePresence>
              {isRoomFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-[300px] bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo tên phòng"
                        value={roomFilterSearch}
                        onChange={(e) => setRoomFilterSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="max-h-[250px] overflow-y-auto p-2">
                    <div className="grid grid-cols-3 gap-x-2 gap-y-3 p-2">
                      {allRooms
                        .filter(r => r.room_number.toLowerCase().includes(roomFilterSearch.toLowerCase()))
                        .map((r) => {
                          const isSelected = selectedRooms.includes(r.id);
                          return (
                            <label
                              key={r.id}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input 
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-[#14B8A6] focus:ring-[#14B8A6]/20 cursor-pointer"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedRooms(prev => 
                                    prev.includes(r.id) 
                                      ? prev.filter(id => id !== r.id)
                                      : [...prev, r.id]
                                  )
                                }}
                              />
                              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                {isAllBuildings ? `${r.room_number} (${r.building_name})` : r.room_number}
                              </span>
                            </label>
                          );
                      })}
                      {allRooms.filter(r => r.room_number.toLowerCase().includes(roomFilterSearch.toLowerCase())).length === 0 && (
                         <div className="col-span-2 text-center text-sm text-slate-500 py-4">Không tìm thấy phòng</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => setSelectedRooms([])}
                      className="px-4 py-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-md transition-all cursor-pointer"
                    >
                      Đặt lại
                    </button>
                    <button
                      onClick={() => setIsRoomFilterOpen(false)}
                      className="px-4 py-1.5 text-xs font-bold bg-[#14B8A6] text-slate-900 rounded-md shadow-sm hover:brightness-95 transition-all cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status Filters (Đang trống, Đang sử dụng...) */}
        <div className="flex items-center gap-4 py-1">
          {(Object.entries(STATUS) as [RoomStatus, (typeof STATUS)[RoomStatus]][]).map(([statusKey, cfg]) => {
            const isChecked = activeStatuses.includes(statusKey);
            return (
              <label key={statusKey} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isChecked}
                  onChange={() => {
                    setActiveStatuses(prev => 
                      prev.includes(statusKey) 
                        ? prev.filter(s => s !== statusKey)
                        : [...prev, statusKey]
                    )
                  }}
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? cfg.colorClass + ' border-transparent' : cfg.borderColorClass + ' bg-white'}`}>
                  {isChecked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                  {cfg.label}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ?
          <div className="border border-slate-200 bg-white rounded-2xl flex flex-col shadow-sm overflow-hidden min-h-[500px]">
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
              <p className="text-sm font-bold">Đang tải sơ đồ...</p>
            </div>
          </div>
        : buildingSections.length === 0 ?
          <div className="border border-slate-200 bg-white rounded-2xl flex flex-col shadow-sm overflow-hidden min-h-[500px]">
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 gap-4 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">Chưa có dữ liệu</p>
                <p className="text-sm">Vui lòng kiểm tra lại cấu trúc toà nhà</p>
              </div>
            </div>
          </div>
        : <div className="space-y-6">
            {buildingSections.map((section) => (
              <div key={section.id} className="border border-slate-200 bg-white rounded-2xl flex flex-col shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                  <div className="text-brand-primary font-black uppercase text-sm tracking-[0.14em]">
                    {section.name}
                  </div>

                  {/* Legend is no longer needed here as it is moved strictly to the interactive filter bar, but kept as a simple indicator to match old designs if needed, or removed. We'll replace it with a cleaner look */}
                  <div className="text-xs text-slate-400 font-medium">Chi tiết phòng ở tầng này</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {section.sortedFloors.map((floor) => {
                    const rooms = [...section.byFloor[floor]].sort((a, b) =>
                      a.room_number.localeCompare(b.room_number, undefined, { numeric: true }),
                    );

                    return (
                      <div key={`${section.id}-${floor}`} className="flex min-h-[140px] group transition-colors hover:bg-slate-50/30">
                        <div className="w-24 py-4 px-6 flex items-center border-r border-slate-100 font-extrabold text-slate-700 bg-slate-50/20 group-hover:bg-slate-50/50 transition-colors">
                          Tầng {floor}
                        </div>

                        <div className="flex-1 py-6 px-6">
                          <div className="flex flex-wrap gap-5">
                            {rooms.map((room) => {
                              const status = room.status as RoomStatus;
                              const cfg = STATUS[status] ?? STATUS.available;

                              return (
                                <motion.div
                                  key={room.id}
                                  whileHover={{ y: -2 }}
                                  className="w-55 h-28 border border-slate-200 rounded-2xl bg-white flex overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-primary/30 transition-all cursor-default"
                                >
                                  <div className={`w-1.5 shrink-0 ${cfg.colorClass}`} />

                                  <div className="flex-1 p-4 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                      <span className="font-extrabold text-slate-900 tracking-tight text-base">
                                        {room.room_number}
                                      </span>
                                      <button
                                        onClick={() => handleOpenBooking(room)}
                                        className="border border-slate-200 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl text-slate-600 hover:bg-brand-primary hover:text-white hover:border-brand-primary bg-white transition-all active:scale-95 shadow-sm"
                                      >
                                        Đặt chỗ
                                      </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                      <div className="flex gap-2">
                                        <div className={`w-2 h-2 rounded-full ${cfg.colorClass}`} />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                          {cfg.label}
                                        </span>
                                      </div>
                                      <div className="flex items-center text-slate-500 gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold text-slate-700">
                                          {room.current_occupants ?? 0}/{room.max_occupants ?? 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        }
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Tạo đặt phòng – ${activeRoom?.room_number || ""}`}
        size="md"
      >
        <BookingForm
          roomNumber={activeRoom?.room_number || ""}
          onSubmit={handleCreateBooking}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default BookingPage;
