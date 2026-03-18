import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useEnergyData } from '../context/energy-data-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface FileInfo {
  name: string;
  utility: string;
  date: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setData, setFileName } = useEnergyData();
  const navigate = useNavigate();

  const parseFileName = (fileName: string): { utility: string; date: string } => {
    // Format: CAPITL_2025-07-15.csv or CAPITL_prediction_2025-07-15.csv
    const nameWithoutExt = fileName.replace('.csv', '');
    const parts = nameWithoutExt.split('_');
    
    if (parts.length >= 2) {
      const utility = parts[0];
      // Handle both formats: CAPITL_2025-01-15 and CAPITL_prediction_2025-01-15
      // The date is the last part that matches a date pattern
      const datePart = parts.find(part => /^\d{4}-\d{2}-\d{2}$/.test(part));
      
      return {
        utility: utility,
        date: datePart || parts[parts.length - 1]
      };
    }
    
    return {
      utility: 'Unknown',
      date: 'Unknown'
    };
  };

  const processFiles = async (fileList: FileList) => {
    const fileArray = Array.from(fileList);
    const csvFiles = fileArray.filter(f => f.name.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      return;
    }

    const fileInfos: FileInfo[] = csvFiles.map(file => {
      const { utility, date } = parseFileName(file.name);
      return {
        name: file.name,
        utility,
        date,
        status: 'pending'
      };
    });

    setFiles(fileInfos);
    setIsProcessing(true);

    const allData: any[] = [];
    let hasError = false;

    for (let i = 0; i < csvFiles.length; i++) {
      const file = csvFiles[i];
      const { utility, date } = parseFileName(file.name);

      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing' } : f
      ));

      try {
        const data = await new Promise<any[]>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(new Error('Error parsing CSV'));
                return;
              }

              // Add utility and week info to each data point
              const dataWithMetadata = (results.data as any[]).map(point => ({
                ...point,
                utility: utility,
                weekStart: date,
                fileName: file.name
              }));

              resolve(dataWithMetadata);
            },
            error: (error) => {
              reject(error);
            },
          });
        });

        allData.push(...data);

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' } : f
        ));
      } catch (error) {
        hasError = true;
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', error: 'Failed to parse file' } : f
        ));
      }
    }

    setIsProcessing(false);

    if (allData.length > 0 && !hasError) {
      setData(allData);
      setFileName(`${csvFiles.length} file(s) uploaded`);
      
      // Navigate to overview after 1.5 seconds
      setTimeout(() => {
        navigate('/overview');
      }, 1500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const getStatusIcon = (status: FileInfo['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="size-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="size-4 text-red-600" />;
      case 'processing':
        return <div className="size-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="size-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Upload NYISO Load Data</h1>
          <p className="text-gray-600">
            Upload CSV files containing NYISO utility load predictions and actuals.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Upload</CardTitle>
            <CardDescription>
              Supports NYISO utilities: CAPITL, HUD VL, MILLWD, CENTRL, WEST, MHK VL, NORTH, GENESE, N.Y.C., DUNWOOD, LONGIL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
              
              <Upload className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2 text-gray-700">
                Drop your CSV files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports multiple .csv files (CAPITL_2025-07-15.csv format)
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Files ({files.length})
                </h3>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.utility} - Week of {file.date}
                        </p>
                        {file.error && (
                          <p className="text-xs text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>
                    {!isProcessing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X className="size-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isProcessing && (
              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  Processing files... Please wait.
                </AlertDescription>
              </Alert>
            )}

            {!isProcessing && files.length > 0 && files.every(f => f.status === 'success') && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="size-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  All files uploaded successfully! Redirecting to overview...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Expected CSV Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>
{`Hour Start,actual_load,predicted_load,error,abs_error,percent_error
2026-03-10 00:00:00,5234.5,5189.2,45.3,45.3,0.87
2026-03-10 01:00:00,4982.1,5021.8,-39.7,39.7,0.80
2026-03-10 02:00:00,4756.3,4801.5,-45.2,45.2,0.95`}
              </pre>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><strong>Column Descriptions:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Hour Start:</strong> Timestamp for the hourly reading</li>
                <li><strong>actual_load:</strong> Actual load in MW</li>
                <li><strong>predicted_load:</strong> Predicted load in MW</li>
                <li><strong>error:</strong> Prediction error (actual - predicted)</li>
                <li><strong>abs_error:</strong> Absolute prediction error</li>
                <li><strong>percent_error:</strong> Percentage error</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}