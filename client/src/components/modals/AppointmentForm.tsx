import { useState, useEffect } from "react";
import { useBuilding } from "../../contexts/BuildingContext";
import { api } from "../../lib/api";
import {
	User,
	Mail,
	Phone,
	Calendar,
	Clock,
	Building2,
	MessageSquare,
	UserCheck,
} from "lucide-react";

export interface AppointmentFormData {
	customerName: string;
	email: string;
	phone: string;
	date: string;
	time: string;
	buildingId: string;
	room: string;
	assignedTo: string;
	message: string;
}

interface AppointmentFormProps {
	onSubmit: (data: AppointmentFormData) => void;
	onCancel: () => void;
}

const AppointmentForm = ({ onSubmit, onCancel }: AppointmentFormProps) => {
	const { buildings, selectedBuildingId } = useBuilding();
	const [rooms, setRooms] = useState<{ id: string; room_number: string }[]>([]);
	const [formData, setFormData] = useState<AppointmentFormData>({
		customerName: "",
		email: "",
		phone: "",
		date: "",
		time: "09:00",
		buildingId: selectedBuildingId ?? "all",
		room: "",
		assignedTo: "Lê Trần Bảo Phúc",
		message: "",
	});

	useEffect(() => {
		if (formData.buildingId && formData.buildingId !== "all") {
			api.get<{ rooms: { id: string; room_number: string }[] }>(`/api/rooms?building_id=${formData.buildingId}`)
				.then(({ data }) => {
					if (data?.rooms) {
						setRooms(data.rooms);
					}
				})
				.catch(console.error);
		}
	}, [formData.buildingId]);

	const availableRooms = formData.buildingId === "all" ? [] : rooms;

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		const fieldName = name as keyof AppointmentFormData;

		if (fieldName === "buildingId") {
			setFormData((prev) => ({
				...prev,
				buildingId: value,
				room: "",
			}));
			return;
		}

		setFormData((prev) => ({
			...prev,
			[fieldName]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form
			id="appointment-form"
			onSubmit={handleSubmit}
			className="space-y-5"
		>
			{/* Customer Info Section */}
			<div className="space-y-4">
				<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
					<User className="w-3.5 h-3.5" />
					Thông tin khách hàng <span className="text-rose-500">*</span>
				</label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							name="customerName"
							value={formData.customerName}
							onChange={handleChange}
							required
							placeholder="Tên khách xem phòng"
							className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none"
						/>
					</div>
					<div className="relative">
						<Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							placeholder="Email khách"
							className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none"
						/>
					</div>
				</div>
				<div className="relative">
					<Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
					<input
						type="tel"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						required
						placeholder="Số điện thoại"
						className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none"
					/>
				</div>
			</div>

			<div className="h-px bg-slate-100 my-2" />

			{/* Appointment Info Section */}
			<div className="space-y-4">
				<label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
					<Calendar className="w-3.5 h-3.5" />
					Thời gian & Toà nhà <span className="text-rose-500">*</span>
				</label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
						<input
							type="date"
							name="date"
							value={formData.date}
							onChange={handleChange}
							required
							className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none"
						/>
					</div>
					<div className="relative">
						<Clock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
						<input
							type="time"
							name="time"
							value={formData.time}
							onChange={handleChange}
							required
							className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
						<select
							name="buildingId"
							value={formData.buildingId}
							onChange={handleChange}
							required
							className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none appearance-none"
						>
							<option value="all">Tất cả tòa nhà</option>
							{buildings.map((b) => (
								<option key={b.id} value={b.id}>
									{b.name}
								</option>
							))}
						</select>
					</div>
					<div className="relative">
						<Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
						<select
							name="room"
							value={formData.room}
							onChange={handleChange}
							className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none appearance-none"
						>
							<option value="">Phòng (Không bắt buộc)</option>
							{availableRooms.map((r) => (
								<option key={r.id} value={r.id}>
									{r.room_number}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="relative">
					<UserCheck className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
					<select
						name="assignedTo"
						value={formData.assignedTo}
						onChange={handleChange}
						className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none appearance-none"
					>
						<option value="Lê Trần Bảo Phúc">Người dẫn khách: Lê Trần Bảo Phúc</option>
						<option value="admin">Người dẫn khách: Admin</option>
					</select>
				</div>

				<div className="relative">
					<MessageSquare className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
					<textarea
						name="message"
						value={formData.message}
						onChange={handleChange}
						rows={3}
						placeholder="Lời nhắn cho khách hàng hoặc nhân viên..."
						className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none resize-none"
					/>
				</div>
			</div>

			<div className="flex items-center justify-end gap-3 pt-6">
				<button
					type="button"
					onClick={onCancel}
					className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
				>
					Hủy
				</button>
				<button
					type="submit"
					className="px-10 py-3.5 bg-teal-600 text-white rounded-2xl text-sm font-bold hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition-all active:scale-95"
				>
					Đặt lịch xem phòng
				</button>
			</div>
		</form>
	);
};

export default AppointmentForm;
