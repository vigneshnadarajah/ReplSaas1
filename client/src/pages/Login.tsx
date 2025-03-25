
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userId = document.querySelector('meta[name="replit-user-id"]')?.getAttribute('content');
    if (userId) {
      setLocation('/');
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-center mb-6">CSV Manager</h1>
          <div className="flex flex-col items-center gap-4">
            <div id="auth-button"></div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking authentication...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
