import { Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function MapsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Construction className="size-20 text-gray-400" />
            </div>
            <CardTitle className="text-3xl">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-lg mb-4">
              The NYISO Utility Map feature is currently under development.
            </p>
            <p className="text-gray-500">
              This page will soon display an interactive geographic visualization of load distribution across NYISO zones.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
