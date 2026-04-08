import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load env vars BEFORE any internal imports that might use them!
dotenv.config();

import authRoutes from "./routes/auth";
import mapRoutes from "./routes/map";
import buildingRoutes from "./routes/buildings";
import roomRoutes from "./routes/rooms";
import listingRoutes from "./routes/listings";
import searchRoutes from "./routes/search";
import adminRoutes from "./routes/admin";
import qrRoutes from "./routes/qr";
import dashboardRoutes from "./routes/dashboard";
import contractRoutes from "./routes/contracts";
import customerRoutes from "./routes/customers";
import vehicleRoutes from "./routes/vehicles";
import reservationRoutes from "./routes/reservations";
import appointmentRoutes from "./routes/appointments";
import invoiceRoutes from "./routes/invoices";
import transactionRoutes from "./routes/transactions";
import bankAccountRoutes from "./routes/bankAccounts";
import incidentTypeRoutes from "./routes/incidentTypes";
import incidentRoutes from "./routes/incidents";
import businessSettingsRoutes from "./routes/businessSettings";
import contractTemplatesRouter from './routes/contractTemplates';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	"https://website-apartment-two.vercel.app",
	"https://website-apartment.onrender.com",
];
if (process.env.FRONTEND_URL) {
	allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middleware
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);

			// Automatically allow any Vercel deployment URL (extremely useful for Vercel Previews)
			if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	}),
);

// crucial: automatically respond to all OPTIONS preflight requests with 204 instead of letting them fall through to 404!
app.options(
	/^(.*)$/,
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	}),
);

app.use(express.json({ limit: "10mb" })); // Increased for image data
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/visit-tours", appointmentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/incident-types", incidentTypeRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/business-settings", businessSettingsRoutes);
app.use('/api/contract-templates', contractTemplatesRouter);

// Health check route
app.get("/api/health", (_req: Request, res: Response) => {
	res.json({
		status: "ok",
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

// Catch-all route for undefined API endpoints
app.use(/^(.*)$/, (_req: Request, res: Response) => {
	res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
