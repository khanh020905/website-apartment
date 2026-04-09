import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Globe,
  List,
  Calendar as CalendarIcon,
  ChevronDown,
  Users,
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

const BookingPage = () => {
  const { selectedBuildingId } = useBuilding();

  const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [selectedFloor, setSelectedFloor] = useState<number | "all">("all");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

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
    
    const payload = {
      customer_name: formData.customerName,
      customer_phone: formData.phone,
      customer_email: formData.email,
      check_in_date: formData.checkInDate,
      deposit_amount: formData.depositAmount,
      room_id: activeRoom.id,
      building_id: activeRoom.building_id,
      notes: formData.notes
    };

    const { error } = await api.post("/api/reservations", payload);
    if (!error) {
      setIsModalOpen(false);
      fetchBuildings(); // Refresh to show room status if changed
    } else {
      alert(error);
    }
  };

  const currentBuilding =
    selectedBuildingId ?
      (buildings.find((b) => b.id === selectedBuildingId) ?? buildings[0])
    : buildings[0];

  const allRooms: Room[] = (currentBuilding?.rooms as any) ?? [];
  const floors = [...new Set(allRooms.map((r) => r.floor || 1))].sort((a, b) => a - b);

  const filteredRooms = allRooms.filter((r) => {
    if (selectedFloor !== "all" && (r.floor || 1) !== selectedFloor) return false;
    if (selectedRoom && r.room_number !== selectedRoom) return false;
    return true;
  });

  const byFloor: Record<number, Room[]> = {};
  filteredRooms.forEach((r) => {
    const f = r.floor || 1;
    if (!byFloor[f]) byFloor[f] = [];
    byFloor[f].push(r);
  });
  const sortedFloors = Object.keys(byFloor)
    .map(Number)
    .sort((a, b) => a - b);

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold">Đặt phòng</h1>
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
      <div className="flex items-center px-6 py-3 gap-3 bg-slate-50/30">
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

        <div className="relative border border-slate-200 rounded-xl bg-white min-w-[150px] hover:border-brand-primary transition-all">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full appearance-none bg-transparent px-3 py-2 text-sm text-slate-600 focus:outline-none font-medium cursor-pointer"
          >
            <option value="">Chọn phòng</option>
            {allRooms.map((r) => (
              <option key={r.id} value={r.room_number}>
                {r.room_number}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="border border-slate-200 bg-white rounded-2xl flex flex-col shadow-sm overflow-hidden min-h-[500px]">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <div className="w-24 font-black uppercase text-[10px] tracking-widest text-slate-400">
              Sơ đồ tầng
            </div>

            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {(Object.entries(STATUS) as [RoomStatus, (typeof STATUS)[RoomStatus]][]).map(
                ([, cfg]) => (
                  <div key={cfg.label} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full border-2 bg-white ${cfg.borderColorClass}`} />
                    <span>{cfg.label}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {loading ?
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
              <p className="text-sm font-bold">Đang tải sơ đồ...</p>
            </div>
          : !currentBuilding || sortedFloors.length === 0 ?
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 gap-4 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">Chưa có dữ liệu</p>
                <p className="text-sm">Vui lòng kiểm tra lại cấu trúc toà nhà</p>
              </div>
            </div>
          : <div className="divide-y divide-slate-100">
              {sortedFloors.map((floor) => {
                const rooms = byFloor[floor].sort((a, b) =>
                  a.room_number.localeCompare(b.room_number, undefined, { numeric: true }),
                );

                return (
                  <div key={floor} className="flex min-h-[140px] group transition-colors hover:bg-slate-50/30">
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
          }
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng ký giữ chỗ"
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
