
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

// Define the structure for an attendance record
interface AttendanceRecord {
  nom: string;
  prenom: string;
  codeApogee: string;
  cne: string;
  timestamp: string;
  status: 'présent'; // Only present students are in the list based on scan logic
}

export default function ListPage() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    // Load data from local storage on component mount
    const storedList = localStorage.getItem('attendanceList');
    if (storedList) {
      setAttendanceList(JSON.parse(storedList));
    }
  }, []);

  const exportToCSV = () => {
    if (attendanceList.length === 0) {
      alert("No attendance data to export.");
      return;
    }

    const headers = ["Nom", "Prénom", "Code Apogée", "CNE", "Timestamp", "Status"];
    const csvRows = [
      headers.join(','), // Header row
      ...attendanceList.map(row =>
        [
          `"${row.nom}"`,
          `"${row.prenom}"`,
          `"${row.codeApogee}"`,
          `"${row.cne}"`,
          `"${row.timestamp}"`,
          `"${row.status}"`,
        ].join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'attendance_list.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
        alert("CSV export is not supported in your browser.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Attendance List</h1>
        <Button onClick={exportToCSV} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableCaption>List of students marked present.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Code Apogée</TableHead>
              <TableHead>CNE</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceList.length > 0 ? (
              attendanceList.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{record.nom}</TableCell>
                  <TableCell>{record.prenom}</TableCell>
                  <TableCell>{record.codeApogee}</TableCell>
                  <TableCell>{record.cne}</TableCell>
                  <TableCell>{record.timestamp}</TableCell>
                  <TableCell className="text-right">
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                         {record.status}
                     </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No attendance records found. Scan QR codes to populate the list.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
