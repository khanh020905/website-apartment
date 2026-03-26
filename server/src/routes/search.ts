import { Router, Request, Response } from 'express';
import { getSupabase } from '../lib/supabase';

const router = Router();

// GET /api/search — Advanced search with filters
router.get('/', async (req: Request, res: Response) => {
  const {
    priceMin, priceMax, areaMin, areaMax,
    bedrooms, bathrooms, propertyTypes, furniture,
    amenityIds, city, district, ward, keyword,
    direction, isVerified, // Added filters
    sortBy = 'newest', page = '1', limit = '20',
    lat, lng, radius, // for map-based search
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let query = getSupabase()
    .from('listings')
    .select('*, profiles!posted_by(full_name, phone, avatar_url)', { count: 'exact' })
    .eq('status', 'approved');

  // Price range
  if (priceMin) query = query.gte('price', Number(priceMin));
  if (priceMax) query = query.lte('price', Number(priceMax));

  // Area range
  if (areaMin) query = query.gte('area', Number(areaMin));
  if (areaMax) query = query.lte('area', Number(areaMax));

  // Bedrooms
  if (bedrooms && bedrooms !== 'any') {
    const bedroomNum = Number(bedrooms);
    if (bedroomNum >= 4) {
      query = query.gte('bedrooms', 4);
    } else {
      query = query.eq('bedrooms', bedroomNum);
    }
  }

  // Bathrooms
  if (bathrooms && bathrooms !== 'any') {
    const bathroomNum = Number(bathrooms);
    if (bathroomNum >= 3) {
      query = query.gte('bathrooms', 3);
    } else {
      query = query.eq('bathrooms', bathroomNum);
    }
  }

  // Property types (comma-separated)
  if (propertyTypes) {
    const types = (propertyTypes as string).split(',');
    query = query.in('property_type', types);
  }

  // Furniture
  if (furniture && furniture !== 'any') {
    query = query.eq('furniture', furniture as string);
  }

  // Amenities (must have all specified amenities)
  if (amenityIds) {
    const ids = (amenityIds as string).split(',').map(Number);
    query = query.contains('amenity_ids', ids);
  }

  // Location cascade
  if (city) query = query.eq('city', city as string);
  if (district) query = query.eq('district', district as string);
  if (ward) query = query.eq('ward', ward as string);

  // Keyword search (title, address, description)
  if (keyword) {
    const kw = keyword as string;
    query = query.or(`title.ilike.%${kw}%,address.ilike.%${kw}%,description.ilike.%${kw}%`);
  }

  // Direction
  if (direction) {
    query = query.eq('direction', direction as string);
  }

  // Verification status
  if (isVerified === 'true') {
    query = query.eq('is_verified', true);
  }

  // Sorting
  switch (sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'area_asc':
      query = query.order('area', { ascending: true });
      break;
    case 'area_desc':
      query = query.order('area', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Pagination
  query = query.range(offset, offset + Number(limit) - 1);

  const { data, error, count } = await query;

  if (error) { res.status(400).json({ error: error.message }); return; }

  res.json({
    listings: data,
    total: count || 0,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil((count || 0) / Number(limit)),
  });
});

// GET /api/search/map — Get listings for map view (lightweight, only coords + basic info)
router.get('/map', async (req: Request, res: Response) => {
  const {
    priceMin, priceMax, areaMin, areaMax,
    propertyTypes, city, district,
    direction, isVerified,
  } = req.query;

  let query = getSupabase()
    .from('listings')
    .select('id, title, price, area, lat, lng, images, property_type')
    .eq('status', 'approved')
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (priceMin) query = query.gte('price', Number(priceMin));
  if (priceMax) query = query.lte('price', Number(priceMax));
  if (areaMin) query = query.gte('area', Number(areaMin));
  if (areaMax) query = query.lte('area', Number(areaMax));
  if (propertyTypes) query = query.in('property_type', (propertyTypes as string).split(','));
  if (city) query = query.eq('city', city as string);
  if (district) query = query.eq('district', district as string);
  if (direction) query = query.eq('direction', direction as string);
  if (isVerified === 'true') query = query.eq('is_verified', true);

  const { data, error } = await query;

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ listings: data });
});

// GET /api/search/amenities — Get all available amenities
router.get('/amenities', async (_req: Request, res: Response) => {
  const { data, error } = await getSupabase()
    .from('amenities')
    .select('*')
    .order('id', { ascending: true });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ amenities: data });
});

export default router;
