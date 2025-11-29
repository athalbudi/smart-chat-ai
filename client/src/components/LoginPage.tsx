import { useState } from 'react';
import { api } from '@/lib/api'; // <--- Gunakan API Client pusat
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Gunakan api client. 
      // URL cukup '/auth/login' karena baseURL sudah di-set '/api' di lib/api.ts
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // Jika sukses, simpan data ke Store
      const { user, token } = response.data;
      login(user, token);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome Back</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Login to access your Smart Chat AI
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus:ring-blue-500 text-zinc-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus:ring-blue-500 text-zinc-100"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-zinc-200" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}