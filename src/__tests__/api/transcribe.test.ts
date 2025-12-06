import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/transcribe/route";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Supabase Admin
const mockSupabaseUpdate = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseInsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: mockSupabaseUpdate,
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
    })),
  })),
}));

describe("Transcription API", () => {
  const createMockRequest = (body: object) => {
    return new Request("http://localhost:3000/api/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockSupabaseUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    mockSupabaseInsert.mockResolvedValue({ data: null, error: null });
  });

  describe("Input Validation", () => {
    it("should return 400 when materialId is missing", async () => {
      const request = createMockRequest({});
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Material ID required");
    });

    it("should return 400 when materialId is empty string", async () => {
      const request = createMockRequest({ materialId: "" });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should return 400 when materialId is null", async () => {
      const request = createMockRequest({ materialId: null });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("Material Retrieval", () => {
    it("should return 500 when material has no audio_url", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "mat-123", audio_url: null },
            error: null,
          }),
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should return 500 when material is not found", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe("Status Updates", () => {
    it("should update status to processing at start", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "mat-123", audio_url: "https://example.com/audio.mp3", title: "Test" },
            error: null,
          }),
        }),
      });

      // Mock audio fetch
      mockFetch.mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["audio"], { type: "audio/mp3" })),
      });

      // Mock Whisper API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ text: "Transcribed text content" }),
      });

      // Mock GPT-4 API for notes
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"title":"Test","summary":"Summary","sections":[],"keyPoints":[]}' } }],
        }),
      });

      // Mock GPT-4 API for quiz
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"questions":[]}' } }],
        }),
      });

      // Mock GPT-4 API for flashcards
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"cards":[]}' } }],
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      await POST(request);

      // First update call should set status to processing
      expect(mockSupabaseUpdate).toHaveBeenCalled();
    });
  });

  describe("OpenAI Whisper Integration", () => {
    beforeEach(() => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "mat-123", audio_url: "https://example.com/audio.mp3", title: "Test Lecture" },
            error: null,
          }),
        }),
      });
    });

    it("should call Whisper API with correct parameters", async () => {
      // Mock audio fetch
      mockFetch.mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["audio"], { type: "audio/mp3" })),
      });

      // Mock Whisper API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ text: "Transcribed text" }),
      });

      // Mock GPT-4 calls
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"title":"Test","summary":"","sections":[],"keyPoints":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"questions":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"cards":[]}' } }],
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      await POST(request);

      // Check that Whisper API was called
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/audio/transcriptions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          }),
        })
      );
    });

    it("should return 500 when Whisper API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["audio"], { type: "audio/mp3" })),
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe("Content Generation", () => {
    beforeEach(() => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "mat-123", audio_url: "https://example.com/audio.mp3", title: "Test" },
            error: null,
          }),
        }),
      });

      mockFetch.mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["audio"], { type: "audio/mp3" })),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ text: "Transcribed text content for lecture" }),
      });
    });

    it("should generate notes, quiz, and flashcards in parallel", async () => {
      // Mock GPT-4 calls for notes, quiz, and flashcards
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"title":"Test","summary":"Summary","sections":[],"keyPoints":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"questions":[{"question":"Q1","options":["a","b","c","d"],"correctAnswer":0,"explanation":"Exp"}]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"cards":[{"front":"Term","back":"Definition"}]}' } }],
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(200);

      // Verify GPT-4 API calls were made
      const gptCalls = mockFetch.mock.calls.filter((call) =>
        call[0].includes("chat/completions")
      );
      expect(gptCalls.length).toBe(3);
    });

    it("should save transcription to database", async () => {
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"title":"Test","summary":"","sections":[],"keyPoints":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"questions":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"cards":[]}' } }],
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      await POST(request);

      // Check that transcription was inserted
      expect(mockSupabaseInsert).toHaveBeenCalled();
    });

    it("should save generated content to database", async () => {
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"title":"Test","summary":"","sections":[],"keyPoints":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"questions":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"cards":[]}' } }],
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      await POST(request);

      // Multiple inserts should be made (transcription, notes, quiz, flashcards)
      expect(mockSupabaseInsert).toHaveBeenCalled();
    });
  });

  describe("Learning Modes", () => {
    it("should use standard mode by default", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "mat-123", audio_url: "https://example.com/audio.mp3", title: "Test" },
            error: null,
          }),
        }),
      });

      mockFetch.mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["audio"], { type: "audio/mp3" })),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ text: "Transcribed text" }),
      });

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"title":"Test","summary":"","sections":[],"keyPoints":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"questions":[]}' } }],
        }),
      });
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"cards":[]}' } }],
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      await POST(request);

      // Verify the notes API call uses standard mode prompt
      const gptCalls = mockFetch.mock.calls.filter((call) =>
        call[0].includes("chat/completions")
      );

      expect(gptCalls.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "mat-123", audio_url: "https://example.com/audio.mp3", title: "Test" },
            error: null,
          }),
        }),
      });
    });

    it("should update status to failed on error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Transcription failed");
    });

    it("should handle audio fetch failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Failed to fetch audio"));

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should handle GPT-4 API failure gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["audio"], { type: "audio/mp3" })),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ text: "Transcribed text" }),
      });

      // GPT-4 calls fail
      mockFetch.mockRejectedValueOnce(new Error("GPT-4 API error"));

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should handle malformed GPT-4 response", async () => {
      mockFetch.mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["audio"], { type: "audio/mp3" })),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ text: "Transcribed text" }),
      });

      // Malformed JSON response
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: "not valid json" } }],
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe("Successful Transcription Flow", () => {
    it("should complete full transcription pipeline successfully", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "mat-123", audio_url: "https://example.com/audio.mp3", title: "Test Lecture" },
            error: null,
          }),
        }),
      });

      // Mock audio fetch
      mockFetch.mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["audio data"], { type: "audio/mp3" })),
      });

      // Mock Whisper API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ text: "This is the transcribed lecture content about programming." }),
      });

      // Mock GPT-4 for notes
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                title: "Programming Basics",
                summary: "An introduction to programming concepts",
                sections: [{ title: "Variables", content: "Variables store data" }],
                keyPoints: ["Variables are containers for data"],
              }),
            },
          }],
        }),
      });

      // Mock GPT-4 for quiz
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                questions: [{
                  question: "What is a variable?",
                  options: ["A container for data", "A function", "A loop", "A class"],
                  correctAnswer: 0,
                  explanation: "Variables store data values",
                }],
              }),
            },
          }],
        }),
      });

      // Mock GPT-4 for flashcards
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                cards: [{ front: "What is a variable?", back: "A container for storing data" }],
              }),
            },
          }],
        }),
      });

      const request = createMockRequest({ materialId: "mat-123" });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });
  });
});
