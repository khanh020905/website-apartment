import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";

interface Building {
	id: string;
	name: string;
	address?: string;
}

interface BuildingContextType {
	buildings: Building[];
	selectedBuildingId: string | null;
	setSelectedBuildingId: (id: string | null) => void;
	loading: boolean;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export const BuildingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user, role } = useAuth();
	const [buildings, setBuildings] = useState<Building[]>([]);
	const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user && (role === "landlord" || role === "admin")) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setLoading(true);
			api
				.get<{ buildings: Building[] }>("/api/buildings")
				.then(({ data }) => {
					if (data && data.buildings) {
						setBuildings(data.buildings);
					}
				})
				.finally(() => setLoading(false));
		} else {
			setBuildings([]);
			setSelectedBuildingId(null);
		}
	}, [user, role]);

	return (
		<BuildingContext.Provider
			value={{ buildings, selectedBuildingId, setSelectedBuildingId, loading }}
		>
			{children}
		</BuildingContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBuilding = () => {
	const context = useContext(BuildingContext);
	if (context === undefined) {
		throw new Error("useBuilding must be used within a BuildingProvider");
	}
	return context;
};
