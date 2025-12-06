import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// Mock Supabase SSR
const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => {
    return {
      auth: {
        getUser: mockGetUser,
      },
    };
  }),
}));

// Import after mocking
import { updateSession } from "@/lib/supabase/middleware";

describe("Auth Middleware", () => {
  const createMockRequest = (pathname: string, cookies: Record<string, string> = {}) => {
    const url = new URL(`http://localhost:3000${pathname}`);

    const cookieEntries = Object.entries(cookies).map(([name, value]) => ({
      name,
      value,
    }));

    // Create a proper mock with clone method
    const nextUrl = {
      ...url,
      pathname: url.pathname,
      clone: () => new URL(url.toString()),
    };

    return {
      nextUrl,
      cookies: {
        getAll: vi.fn(() => cookieEntries),
        set: vi.fn(),
      },
      url: url.toString(),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Protected Routes - Unauthenticated Users", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it("should redirect unauthenticated users from /dashboard to /auth/login", async () => {
      const request = createMockRequest("/dashboard");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/login");
    });

    it("should redirect unauthenticated users from /dashboard/materials to /auth/login", async () => {
      const request = createMockRequest("/dashboard/materials");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/login");
    });

    it("should redirect unauthenticated users from /dashboard/settings to /auth/login", async () => {
      const request = createMockRequest("/dashboard/settings");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/login");
    });

    it("should redirect unauthenticated users from /api/protected/* to /auth/login", async () => {
      const request = createMockRequest("/api/protected/data");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/login");
    });

    it("should allow unauthenticated users to access public routes", async () => {
      const request = createMockRequest("/");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });

    it("should allow unauthenticated users to access /auth/login", async () => {
      const request = createMockRequest("/auth/login");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });

    it("should allow unauthenticated users to access /auth/register", async () => {
      const request = createMockRequest("/auth/register");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe("Auth Routes - Authenticated Users", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123", email: "test@example.com" } },
      });
    });

    it("should redirect authenticated users from /auth/login to /dashboard", async () => {
      const request = createMockRequest("/auth/login");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });

    it("should redirect authenticated users from /auth/register to /dashboard", async () => {
      const request = createMockRequest("/auth/register");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });

    it("should allow authenticated users to access /dashboard", async () => {
      const request = createMockRequest("/dashboard");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });

    it("should allow authenticated users to access /dashboard/materials", async () => {
      const request = createMockRequest("/dashboard/materials");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });

    it("should allow authenticated users to access public routes", async () => {
      const request = createMockRequest("/");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe("Public Routes", () => {
    it("should allow access to landing page for anyone", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const request = createMockRequest("/");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });

    it("should allow access to pricing page for anyone", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const request = createMockRequest("/pricing");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });

    it("should allow access to public API routes", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const request = createMockRequest("/api/public/health");
      const response = await updateSession(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe("Session Management", () => {
    it("should call getUser to check authentication", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const request = createMockRequest("/");

      await updateSession(request);

      expect(mockGetUser).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle /dashboard exactly (not just prefix)", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const request = createMockRequest("/dashboard");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
    });

    it("should protect routes that start with /dashboard", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const request = createMockRequest("/dashboard-extended");
      const response = await updateSession(request);

      // Note: Current implementation uses startsWith, so this would be protected
      // This documents the actual behavior
      expect(response.status).toBe(307);
    });

    it("should handle nested dashboard routes", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const request = createMockRequest("/dashboard/learn/123/notes");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
    });

    it("should handle deeply nested protected API routes", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const request = createMockRequest("/api/protected/users/123/settings");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
    });
  });
});
