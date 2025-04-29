
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, UserCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Using the toast hook

// Mock student data for QR code simulation
const MOCK_QR_DATA: { [key: string]: { nom: string; prenom: string; codeApogee: string; cne: string } } = {
  "valid-qr-123": { nom: "Doe", prenom: "John", codeApogee: "123456", cne: "CNE789" },
  "valid-qr-456": { nom: "Smith", prenom: "Jane", codeApogee: "654321", cne: "CNE987" },
  "valid-qr-789": { nom: "Dupont", prenom: "Pierre", codeApogee: "112233", cne: "CNE456" },
};

// Define the structure for an attendance record
interface AttendanceRecord {
  nom: string;
  prenom: string;
  codeApogee: string;
  cne: string;
  timestamp: string;
  status: 'présent';
}

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<AttendanceRecord | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const { toast } = useToast(); // Initialize toast

  // Mock function to simulate scanning a QR code
  const simulateScan = () => {
    setIsScanning(true);
    setLastScanResult(null); // Clear previous result
    setScanError(null); // Clear previous error

    // Simulate delay for scanning
    setTimeout(() => {
      setIsScanning(false);

      // Randomly pick a QR code (or simulate an invalid one)
      const qrCodes = Object.keys(MOCK_QR_DATA);
      const randomChance = Math.random();
      let scannedCode: string;

      if (randomChance < 0.8) { // 80% chance of valid scan
        scannedCode = qrCodes[Math.floor(Math.random() * qrCodes.length)];
      } else { // 20% chance of invalid scan
        scannedCode = "invalid-qr-code";
      }


      const studentData = MOCK_QR_DATA[scannedCode];

      if (studentData) {
        const now = new Date();
        const record: AttendanceRecord = {
          ...studentData,
          timestamp: now.toLocaleString(), // Record scan time
          status: 'présent',
        };
        setLastScanResult(record);
        // Store in local storage (as requested - no DB interaction)
        const currentList = JSON.parse(localStorage.getItem('attendanceList') || '[]') as AttendanceRecord[];
        // Avoid duplicates based on codeApogee
        if (!currentList.some(r => r.codeApogee === record.codeApogee)) {
            currentList.push(record);
            localStorage.setItem('attendanceList', JSON.stringify(currentList));
            toast({ // Success toast
                title: "Attendance Marked",
                description: `${record.prenom} ${record.nom} marked as present.`,
                variant: "default",
            });
        } else {
             toast({ // Info toast for duplicates
                title: "Already Marked",
                description: `${record.prenom} ${record.nom} is already marked present.`,
             });
             setScanError("Student already marked present."); // Show error state too
        }

      } else {
        setScanError("Invalid QR Code Scanned.");
         toast({ // Error toast
            title: "Scan Failed",
            description: "Invalid QR code detected.",
            variant: "destructive",
         });
      }
    }, 1000); // 1 second scan simulation
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Scan Student QR Code</h1>

      <div className="flex flex-col items-center space-y-6">
         {/* Simple visual representation of a scanner area */}
         <div className="w-64 h-64 md:w-80 md:h-80 border-4 border-dashed border-primary rounded-lg flex items-center justify-center bg-muted/30 relative overflow-hidden">
            <ScanLine className={`absolute text-accent transition-transform duration-[3s] ease-linear ${isScanning ? 'animate-scan' : ''} w-full h-1`} />
             {!isScanning && <ScanLine className="w-16 h-16 text-muted-foreground" />}
             {isScanning && <p className="text-muted-foreground">Scanning...</p>}
          </div>


        <Button
          onClick={simulateScan}
          disabled={isScanning}
          className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-full shadow-md"
        >
          {isScanning ? (
             <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scanning...
            </>
          ) : (
            <>
              <ScanLine className="mr-2 h-6 w-6" />
              Start Scan
            </>
          )}
        </Button>

         {/* Display Scan Result or Error */}
        {(lastScanResult || scanError) && (
            <Card className={`w-full max-w-md ${scanError ? 'border-destructive' : 'border-green-500'}`}>
            <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${scanError ? 'text-destructive' : 'text-green-600'}`}>
                {scanError ? <AlertCircle /> : <UserCheck />}
                {scanError ? 'Scan Failed' : 'Scan Successful'}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                {lastScanResult && !scanError && (
                <div className="space-y-1">
                    <p><strong>Name:</strong> {lastScanResult.prenom} {lastScanResult.nom}</p>
                    <p><strong>Code Apogée:</strong> {lastScanResult.codeApogee}</p>
                    <p><strong>CNE:</strong> {lastScanResult.cne}</p>
                    <p><strong>Time:</strong> {lastScanResult.timestamp}</p>
                    <p><strong>Status:</strong> <span className="font-semibold text-green-600 uppercase">{lastScanResult.status}</span></p>
                </div>
                )}
                 {scanError && (
                    <p className="text-destructive">{scanError}</p>
                 )}
            </CardContent>
            </Card>
        )}
      </div>
       {/* Keyframes for scan animation */}
       <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
