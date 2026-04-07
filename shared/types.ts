// ============================================
// Rental Platform - Shared Database Types
// ============================================

// --- Enums ---

export type UserRole = 'user' | 'landlord' | 'broker' | 'admin';

export type SubscriptionTier = 'free' | 'broker_basic' | 'broker_pro' | 'landlord_basic' | 'landlord_pro';

export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type PropertyType = 'phong_tro' | 'can_ho_mini' | 'chung_cu' | 'nha_nguyen_can';

export type FurnitureStatus = 'full' | 'basic' | 'none';

export type ContractStatus = 'active' | 'expired' | 'terminated' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ReviewAction = 'approved' | 'rejected';

export type HomeDirection = 'East' | 'West' | 'South' | 'North' | 'NorthEast' | 'NorthWest' | 'SouthEast' | 'SouthWest';


// --- Display Labels (Vietnamese) ---

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  phong_tro: 'Phòng trọ',
  can_ho_mini: 'Căn hộ mini',
  chung_cu: 'Căn hộ chung cư',
  nha_nguyen_can: 'Nhà nguyên căn',
};

export const FURNITURE_LABELS: Record<FurnitureStatus, string> = {
  full: 'Đầy đủ',
  basic: 'Cơ bản',
  none: 'Không nội thất',
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Còn trống',
  occupied: 'Đang sử dụng',
  maintenance: 'Đang bảo trì',
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Bản nháp',
  pending: 'Đang chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Bị từ chối',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Khách',
  landlord: 'Chủ trọ',
  broker: 'Môi giới',
  admin: 'Quản trị viên',
};


// --- Table Interfaces ---

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  subscription: SubscriptionTier;
  is_verified: boolean;
  dob: string | null;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  name_vi: string;
  icon: string | null;
  created_at: string;
}

export interface Building {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  floors: number;
  description: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  building_id: string;
  room_number: string;
  floor: number;
  area: number | null;
  price: number | null;
  max_occupants: number;
  current_occupants: number;
  status: RoomStatus;
  furniture: FurnitureStatus;
  amenity_ids: number[];
  images: string[];
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  url: string;
  order: number;
}

export interface Listing {
  id: string;
  posted_by: string;
  room_id: string | null;
  title: string;
  description: string | null;
  price: number;
  area: number | null;
  bedrooms: number;
  bathrooms: number;
  property_type: PropertyType;
  furniture: FurnitureStatus;
  address: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  contact_phone: string;
  contact_name: string | null;
  images: ListingImage[];
  amenity_ids: number[];
  status: ListingStatus;
  available_date: string | null;
  direction: HomeDirection | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  assigned_inspector_id: string | null;
  assigned_at: string | null;
  view_count: number;
}

export interface ListingReviewChecklist {
  addressMatched?: boolean;
  roomConditionMatched?: boolean;
  amenitiesMatched?: boolean;
  imagesMatched?: boolean;
}

export interface ListingReview {
  id: string;
  listing_id: string;
  reviewer_id: string;
  action: ReviewAction;
  notes: string | null;
  checklist: ListingReviewChecklist | null;
  reviewed_at: string;
}

export type ResidenceStatus = 'pending' | 'completed' | 'not_registered';

export interface Contract {
  id: string;
  room_id: string;
  landlord_id: string;
  tenant_name: string;
  tenant_phone: string | null;
  tenant_email: string | null;
  tenant_gender: 'male' | 'female' | 'other' | null;
  tenant_id_number: string | null;
  residence_status: ResidenceStatus | null;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  deposit_amount: number;
  status: ContractStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  building_id: string;
  code: string;
  generated_by: string;
  is_active: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  room_id: string;
  customer_name: string | null;
  license_plate: string;
  vehicle_type: string; // xe_may, xe_hoi, etc.
  vehicle_name: string | null;
  color: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  room_id: string;
  customer_name: string;
  customer_phone: string | null;
  schedule_time: string;
  status: 'pending' | 'viewed' | 'cancelled';
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  owner_id: string;
  name: string;
  short_name: string | null;
  prefix_code: string | null;
  reminder_days: number;
  content: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  code: string;
  room_id: string;
  customer_name: string | null;
  total: number;
  due_date: string;
  extra_charge: number;
  discount: number;
  has_vat: boolean;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  creator: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  code: string;
  room_id: string | null;
  customer: string | null;
  amount: number;
  flow: 'income' | 'expense';
  category: string;
  pay_type: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  room_id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}


// --- Join / Extended Types ---

export interface RoomWithBuilding extends Room {
  building?: Building;
}

export interface ListingWithProfile extends Listing {
  profile?: Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>;
  amenities?: Amenity[];
}

export interface BuildingWithRooms extends Building {
  rooms?: Room[];
}

export interface ContractWithRoom extends Contract {
  room?: Room & { building?: Building };
}


// --- Form / Input Types ---

export interface CreateBuildingInput {
  name: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;
  floors: number;
  description?: string;
}

export interface CreateRoomInput {
  building_id: string;
  room_number: string;
  floor: number;
  area?: number;
  price?: number;
  max_occupants?: number;
  status?: RoomStatus;
  furniture?: FurnitureStatus;
  amenity_ids?: number[];
  images?: string[];
  description?: string;
}

export interface CreateListingInput {
  title: string;
  description?: string;
  price: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type: PropertyType;
  furniture?: FurnitureStatus;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;
  contact_phone: string;
  contact_name?: string;
  amenity_ids?: number[];
  available_date?: string;
  room_id?: string;
}

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number | null; // null = any
  bathrooms?: number | null;
  propertyTypes?: PropertyType[];
  furniture?: FurnitureStatus;
  direction?: HomeDirection;
  isVerified?: boolean;
  amenityIds?: number[];
  city?: string;
  district?: string;
  ward?: string;
  keyword?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalRooms: number;
  statusCounts: {
    available: number;
    occupied: number;
    maintenance: number;
  };
  revenue: {
    current: number;
    last: number;
  };
  expiringContracts: {
    d7: Contract[];
    d14: Contract[];
    d30: Contract[];
  };
  occupancyRate: number;
  buildingCount: number;
}
