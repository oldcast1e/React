"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TrashStatus = "확인 대기 중" | "확인됨" | "수거완료";

export interface TrashReport {
  id: string;
  image: string;
  address: string;
  latitude: number;
  longitude: number;
  status: TrashStatus;
  createdAt: string;
  region?: string;
  district?: string;
}

interface TrashContextType {
  reports: TrashReport[];
  addReport: (
    report: Omit<TrashReport, "id" | "status" | "createdAt">
  ) => Promise<void>;
  updateReportStatus: (id: string, status: TrashStatus) => Promise<void>;
  getFilteredReports: (
    region?: string,
    district?: string,
    status?: TrashStatus
  ) => TrashReport[];
}

const TrashContext = createContext<TrashContextType | undefined>(undefined);

export const useTrash = () => {
  const context = useContext(TrashContext);
  if (!context) {
    throw new Error("useTrash must be used within a TrashProvider");
  }
  return context;
};

export const TrashProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reports, setReports] = useState<TrashReport[]>([]);

  // Load reports from AsyncStorage on mount
  useEffect(() => {
    const loadReports = async () => {
      try {
        const storedReports = await AsyncStorage.getItem("trashReports");
        if (storedReports) {
          setReports(JSON.parse(storedReports));
        }
      } catch (error) {
        console.error("Failed to load reports from storage", error);
      }
    };

    loadReports();
  }, []);

  // Save reports to AsyncStorage whenever they change
  useEffect(() => {
    const saveReports = async () => {
      try {
        await AsyncStorage.setItem("trashReports", JSON.stringify(reports));
      } catch (error) {
        console.error("Failed to save reports to storage", error);
      }
    };

    if (reports.length > 0) {
      saveReports();
    }
  }, [reports]);

  const addReport = async (
    newReport: Omit<TrashReport, "id" | "status" | "createdAt">
  ) => {
    const report: TrashReport = {
      ...newReport,
      id: Date.now().toString(),
      status: "확인 대기 중",
      createdAt: new Date().toISOString(),
    };

    setReports((prevReports) => [...prevReports, report]);
  };

  const updateReportStatus = async (id: string, status: TrashStatus) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id ? { ...report, status } : report
      )
    );
  };

  const getFilteredReports = (
    region?: string,
    district?: string,
    status?: TrashStatus
  ) => {
    return reports.filter((report) => {
      let match = true;

      if (region && report.region !== region) {
        match = false;
      }

      if (district && report.district !== district) {
        match = false;
      }

      if (status && report.status !== status) {
        match = false;
      }

      return match;
    });
  };

  return (
    <TrashContext.Provider
      value={{
        reports,
        addReport,
        updateReportStatus,
        getFilteredReports,
      }}
    >
      {children}
    </TrashContext.Provider>
  );
};
