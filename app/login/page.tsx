"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { isAuthenticated } from "@/lib/utils/auth";
import type { LoginRequest } from "@/lib/api/types";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error ketika user mulai mengetik
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError("Email harus diisi");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password harus diisi");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Format email tidak valid");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      
      if (response.token) {
        // Redirect ke dashboard setelah login berhasil
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err
        ? String(err.message)
        : "Login gagal. Periksa email dan password Anda.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Timesheesh
          </h1>
          <p className="text-gray-600">Masuk ke akun Anda</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
                aria-invalid={error ? "true" : "false"}
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  aria-invalid={error ? "true" : "false"}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Timesheesh. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

