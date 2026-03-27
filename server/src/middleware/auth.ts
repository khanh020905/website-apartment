import { Request, Response, NextFunction } from "express";
import { getSupabase } from "../lib/supabase";
import type { UserRole } from "../../../shared/types";

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
	user?: {
		id: string;
		email: string;
		role: UserRole;
	};
}

/**
 * Middleware: Authenticate user via Bearer token
 * Attaches user info (including role from profiles) to req.user
 */
export async function authenticate(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const authHeader = req.headers.authorization;
	const token = authHeader?.replace("Bearer ", "");

	if (!token) {
		res.status(401).json({ error: "Không có token xác thực" });
		return;
	}

	try {
		const supabase = getSupabase();

		// Verify token and get user
		const { data: authData, error: authError } = await supabase.auth.getUser(token);

		if (authError || !authData.user) {
			res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
			return;
		}

		// Get role from profiles table
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", authData.user.id)
			.single();

		if (profileError || !profile) {
			// Profile might not exist yet (race condition), default to 'user'
			req.user = {
				id: authData.user.id,
				email: authData.user.email || "",
				role: "user",
			};
		} else {
			req.user = {
				id: authData.user.id,
				email: authData.user.email || "",
				role: profile.role as UserRole,
			};
		}

		next();
	} catch {
		res.status(500).json({ error: "Lỗi xác thực" });
	}
}

/**
 * Middleware factory: Require specific roles
 * Usage: requireRole('landlord', 'broker', 'admin')
 */
export function requireRole(...roles: UserRole[]) {
	return (req: AuthRequest, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ error: "Chưa xác thực" });
			return;
		}

		if (!roles.includes(req.user.role)) {
			res.status(403).json({
				error: "Bạn không có quyền thực hiện chức năng này",
				required: roles,
				current: req.user.role,
			});
			return;
		}

		next();
	};
}

/**
 * Middleware: Require admin role
 */
export const requireAdmin = requireRole("admin");

/**
 * Middleware: Require landlord or broker role
 */
export const requireLandlordOrBroker = requireRole("landlord", "broker");

/**
 * Middleware: Require any authenticated user
 */
export const requireAuth = authenticate;
