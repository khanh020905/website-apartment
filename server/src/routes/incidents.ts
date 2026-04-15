import { Router, Response, NextFunction, Request } from "express";
import multer from "multer";
import { getSupabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

const INCIDENT_PHOTOS_BUCKET = "incident-photos";
const MAX_PHOTO_SIZE = 50 * 1024 * 1024; // 50MB as requested in frontend
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_SIZE }
});

function uploadMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

// GET /api/incidents
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { building_id, status, priority, type_id } = req.query;
  const supabase = getSupabase();
  try {
    let query = supabase
      .from("incidents")
      .select(`
        *,
        type:type_id (name, icon),
        room:room_id (room_number)
      `)
      .order("created_at", { ascending: false });

    if (building_id) query = query.eq("building_id", building_id);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (type_id) query = query.eq("type_id", type_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sự cố:", err);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách sự cố" });
  }
});

// POST /api/incidents
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("incidents")
      .insert({ ...req.body, reported_by: req.user.id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi báo sự cố" });
  }
});

// POST /api/incidents/upload
router.post("/upload", authenticate, uploadMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Chưa chọn tệp" });

  const supabase = getSupabase();
  
  // Ensure bucket exists
  const { data: bucket } = await supabase.storage.getBucket(INCIDENT_PHOTOS_BUCKET);
  if (!bucket) {
    await supabase.storage.createBucket(INCIDENT_PHOTOS_BUCKET, { public: true });
  }

  const extension = file.originalname.split(".").pop();
  const filePath = `${req.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(INCIDENT_PHOTOS_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (uploadError) {
    console.error("Supabase storage upload error:", uploadError);
    return res.status(400).json({ error: uploadError.message });
  }

  const { data: publicUrlData } = supabase.storage
    .from(INCIDENT_PHOTOS_BUCKET)
    .getPublicUrl(filePath);

  console.log("Upload successful, public URL:", publicUrlData.publicUrl);
  res.json({ url: publicUrlData.publicUrl });
});

// PUT /api/incidents/:id
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { id } = req.params;
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("incidents")
      .update(req.body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi cập nhật sự cố" });
  }
});

// DELETE /api/incidents/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Chưa xác thực" });
  const { id } = req.params;
  const supabase = getSupabase();
  try {
    const { error } = await supabase
      .from("incidents")
      .delete()
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi xóa sự cố" });
  }
});

export default router;
