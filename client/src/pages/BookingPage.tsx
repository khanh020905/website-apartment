import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Globe,
  List,
  Calendar as CalendarIcon,
  ChevronDown,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import type { BuildingWithRooms, Room, RoomStatus } from "../../../shared/types";
import { useBuilding } from "../contexts/BuildingContext";

const STATUS = {
  available: {
    label: "Đang trống",
    colorClass: "bg-emerald-500",
    borderColorClass: "border-emerald-500",
  },
  occupied: {
    label: "Đang sử dụng",
    colorClass: "bg-amber-400",
    borderColorClass: "border-amber-400",
  },
  maintenance: {
    label: "Đang bảo trì",
    colorClass: "bg-slate-300",
    borderColorClass: "border-slate-300",
  },
} as const;

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

  const currentBuilding = selectedBuildingId
    ? buildings.find((b) => b.id === selectedBuildingId) ?? buildings[0]
    : buildings[0];

  const allRooms: Room[] = currentBuilding?.rooms ?? [];
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
  const sortedFloors = Object.keys(byFloor).map(Number).sort((a, b) => a - b);

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* Page Header matching the screenshot */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold">Đặt phòng</h1>
        <div className="flex items-center gap-2">
          {/* View Toggle Icons */}
          <button className="p-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 bg-slate-100">
            <Globe className="w-4 h-4 text-slate-700" />
          </button>
          <button className="p-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button className="p-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center px-6 py-3 gap-3">
        {/* Date */}
        <label className="relative flex items-center gap-2 px-3 py-2 border border-slate-200 rounded text-sm text-slate-600 bg-white min-w-[150px] cursor-pointer">
          <span className="text-slate-800">{formatDate(selectedDate)}</span>
          <CalendarDays className="w-4 h-4 ml-auto text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          />
        </label>

        {/* Floor Select - Built as a native select to match simple dropdown style */}
        <div className="relative border border-slate-200 rounded bg-white min-w-[150px]">
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="w-full appearance-none bg-transparent px-3 py-2 text-sm text-slate-600 focus:outline-none"
          >
            <option value="all">Chọn tầng</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                Tầng {f}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Room Select */}
        <div className="relative border border-slate-200 rounded bg-white min-w-[150px]">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full appearance-none bg-transparent px-3 py-2 text-sm text-slate-600 focus:outline-none"
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
        <div className="border border-slate-200 bg-white rounded flex flex-col">
          {/* Table Header & Legend */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-3">
            <div className="w-24 font-semibold text-sm text-slate-700">
              Tầng <span className="text-[10px] ml-1">⇅</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {(Object.entries(STATUS) as [RoomStatus, typeof STATUS[RoomStatus]][]).map(([, cfg]) => (
                <div key={cfg.label} className="flex items-center gap-1.5">
                  <span className={`w-[14px] h-[14px] rounded-[3px] border-2 bg-white ${cfg.borderColorClass}`} />
                  <span>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="py-20 text-center text-slate-500">Đang tải...</div>
          ) : !currentBuilding || sortedFloors.length === 0 ? (
            <div className="py-20 text-center text-slate-500">Chưa có phòng nào.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sortedFloors.map((floor) => {
                const rooms = byFloor[floor].sort((a, b) =>
                  a.room_number.localeCompare(b.room_number, undefined, { numeric: true })
                );

                return (
                  <div key={floor} className="flex min-h-[140px]">
                    {/* Left Floor Label Column */}
                    <div className="w-24 py-4 px-4 flex items-center border-r border-slate-200 font-semibold text-sm text-slate-700">
                      Tầng {floor}
                    </div>

                    {/* Right Rooms Grid */}
                    <div className="flex-1 py-4 px-4">
                      {/* Using flex wrap to match the varying column layout instead of rigid CSS grid */}
                      <div className="flex flex-wrap gap-4">
                        {rooms.map((room) => {
                          const status = room.status as RoomStatus;
                          const cfg = STATUS[status] ?? STATUS.available;

                          return (
                            <div
                              key={room.id}
                              className="w-[200px] h-24 border border-slate-200 rounded-[4px] bg-white flex overflow-hidden shadow-sm"
                            >
                              {/* Left Edge Status Line */}
                              <div className={`w-[5px] shrink-0 ${cfg.colorClass}`} />
                              
                              <div className="flex-1 p-3 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between">
                                  <span className="font-bold text-slate-800 tracking-tight">
                                    {room.room_number}
                                  </span>
                                  <button className="border border-slate-300 text-xs px-2 py-1 rounded-[4px] font-medium text-slate-600 hover:border-slate-400 bg-white">
                                    Đặt phòng
                                  </button>
                                </div>
                                
                                <div className="flex items-center justify-end text-slate-500 gap-1 mt-auto">
                                  <Users className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">
                                    {room.current_occupants ?? 0}/{room.max_occupants ?? 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
