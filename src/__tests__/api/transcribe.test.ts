import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to declare mocks before vi.mock hoisting
const { mockSupabaseFrom } = vi.hoisted(() => ({
  mockSupabaseFrom: vi.fn(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}))

import { POST } from '@/app/api/transcribe/route'

describe('Transcribe API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Input Validation', () => {
    it('should return 400 when materialId is missing', async () => {
      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Material ID required')
    })
  })

  describe('Material Processing', () => {
    it('should update material status to processing', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: 'https://example.com/audio.mp3', title: 'Test Material' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
        insert: mockInsert,
      }))

      // Mock audio fetch
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://example.com/audio.mp3') {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['audio content'], { type: 'audio/mp3' })),
          })
        }
        if (url === 'https://api.openai.com/v1/audio/transcriptions') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ text: 'Transkrypcja tekstu' }),
          })
        }
        if (url === 'https://api.openai.com/v1/chat/completions') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                choices: [
                  {
                    message: {
                      content: JSON.stringify({
                        title: 'Test',
                        summary: 'Summary',
                        sections: [],
                        keyPoints: [],
                        questions: [],
                        cards: [],
                      }),
                    },
                  },
                ],
              }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      await POST(request)

      expect(mockSupabaseFrom).toHaveBeenCalledWith('materials')
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'processing' })
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'mat_123')
    })

    it('should throw error when material has no audio URL', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: null, title: 'Test Material' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
      }))

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Transcription failed')
    })
  })

  describe('OpenAI Integration', () => {
    it('should call Whisper API for transcription', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: 'https://example.com/audio.mp3', title: 'Test' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
        insert: mockInsert,
      }))

      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://example.com/audio.mp3') {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/mp3' })),
          })
        }
        if (url === 'https://api.openai.com/v1/audio/transcriptions') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ text: 'Transkrypcja' }),
          })
        }
        if (url === 'https://api.openai.com/v1/chat/completions') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                choices: [{ message: { content: JSON.stringify({ questions: [], cards: [] }) } }],
              }),
          })
        }
        return Promise.reject(new Error('Unknown'))
      })

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/audio/transcriptions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      )
    })

    it('should return 500 when transcription API fails', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: 'https://example.com/audio.mp3', title: 'Test' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
      }))

      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://example.com/audio.mp3') {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/mp3' })),
          })
        }
        if (url === 'https://api.openai.com/v1/audio/transcriptions') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'API Error' }),
          })
        }
        return Promise.reject(new Error('Unknown'))
      })

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })

  describe('Content Generation', () => {
    it('should generate notes, quiz, and flashcards', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: 'https://example.com/audio.mp3', title: 'Test' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
        insert: mockInsert,
      }))

      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://example.com/audio.mp3') {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/mp3' })),
          })
        }
        if (url === 'https://api.openai.com/v1/audio/transcriptions') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ text: 'Transkrypcja tekstu do nauki' }),
          })
        }
        if (url === 'https://api.openai.com/v1/chat/completions') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                choices: [
                  {
                    message: {
                      content: JSON.stringify({
                        title: 'Notatki',
                        summary: 'Podsumowanie',
                        sections: [{ title: 'Sekcja 1', content: 'Treść' }],
                        keyPoints: ['Punkt 1'],
                        questions: [
                          {
                            question: 'Pytanie?',
                            options: ['A', 'B', 'C', 'D'],
                            correctAnswer: 0,
                            explanation: 'Wyjaśnienie',
                          },
                        ],
                        cards: [{ front: 'Przód', back: 'Tył' }],
                      }),
                    },
                  },
                ],
              }),
          })
        }
        return Promise.reject(new Error('Unknown'))
      })

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      await POST(request)

      // Should call GPT API 3 times (notes, quiz, flashcards)
      const gptCalls = mockFetch.mock.calls.filter(
        (call) => call[0] === 'https://api.openai.com/v1/chat/completions'
      )
      expect(gptCalls.length).toBe(3)
    })

    it('should save transcription to database', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: 'https://example.com/audio.mp3', title: 'Test' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
        insert: mockInsert,
      }))

      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://example.com/audio.mp3') {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/mp3' })),
          })
        }
        if (url === 'https://api.openai.com/v1/audio/transcriptions') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ text: 'Transkrypcja tekstu' }),
          })
        }
        if (url === 'https://api.openai.com/v1/chat/completions') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                choices: [{ message: { content: JSON.stringify({}) } }],
              }),
          })
        }
        return Promise.reject(new Error('Unknown'))
      })

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      await POST(request)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          material_id: 'mat_123',
          content: 'Transkrypcja tekstu',
          language: 'pl',
        })
      )
    })
  })

  describe('Status Updates', () => {
    it('should update material status to completed on success', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: 'https://example.com/audio.mp3', title: 'Test' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
        insert: mockInsert,
      }))

      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://example.com/audio.mp3') {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/mp3' })),
          })
        }
        if (url.includes('openai.com')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                text: 'Transkrypcja',
                choices: [{ message: { content: JSON.stringify({}) } }],
              }),
          })
        }
        return Promise.reject(new Error('Unknown'))
      })

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      await POST(request)

      // Check that final update was to 'completed'
      const lastUpdateCall = mockUpdate.mock.calls[mockUpdate.mock.calls.length - 1]
      expect(lastUpdateCall[0]).toEqual({ status: 'completed' })
    })

    it('should update material status to failed on error', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: 'https://example.com/audio.mp3', title: 'Test' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
      }))

      // Fail at audio fetch
      mockFetch.mockRejectedValue(new Error('Network error'))

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })

  describe('Success Response', () => {
    it('should return success true on completion', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectEqSingle = vi.fn().mockResolvedValue({
        data: { id: 'mat_123', audio_url: 'https://example.com/audio.mp3', title: 'Test' },
        error: null,
      })
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectEqSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })

      mockSupabaseFrom.mockImplementation(() => ({
        update: mockUpdate,
        select: mockSelect,
        insert: mockInsert,
      }))

      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://example.com/audio.mp3') {
          return Promise.resolve({
            blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/mp3' })),
          })
        }
        if (url.includes('openai.com')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                text: 'Transkrypcja',
                choices: [{ message: { content: JSON.stringify({}) } }],
              }),
          })
        }
        return Promise.reject(new Error('Unknown'))
      })

      const request = new Request('http://localhost/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: 'mat_123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
