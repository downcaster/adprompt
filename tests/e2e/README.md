# End-to-End API Tests

⚠️ **WARNING**: These tests make **real API calls** to Google AI Studio and consume quota/credits.

This directory contains E2E tests that verify live integration with Google AI Studio APIs (Gemini and Veo) using real API keys from `.env`.

## Test Files

### `gemini.test.ts`
Tests Gemini 2.5 Flash API integration with:
- Simple text prompts
- Structured JSON response parsing for critique agents

### `integration.test.ts`
Tests the full critique workflow with all four specialist agents:
- BrandFit agent
- VisualQuality agent
- Safety agent
- Clarity agent

Tests both individual agent calls and parallel execution.

### `veo.test.ts`
Tests Veo 3.1 video generation API integration using `@google/genai` SDK.

**Note**: Requires the Generative Language API to be enabled in your Google Cloud project. If you encounter a 403 PERMISSION_DENIED error, enable it at:
https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview

## Running Tests

⚠️ **These tests consume API quota and may incur costs!**

```bash
# Run all API tests (uses real API keys)
npm run test:api

# Run with watch mode
npm run test:api:watch

# Regular unit tests (excludes API tests)
npm run test
```

## Rate Limits

The free tier of Google AI Studio has the following limits:
- **Gemini**: 10 requests per minute
- **Veo**: Limited quota (varies)

If you hit rate limits (HTTP 429), wait ~60 seconds and retry. You can monitor your usage at:
https://ai.dev/usage?tab=rate-limit

## Environment Setup

Ensure your `.env` file contains valid API keys:

```env
GEMINI_API_KEY=your_gemini_key_here
VEO_API_KEY=your_veo_key_here
```

## Test Results

✅ **Gemini Integration**: Working correctly (verified by live API calls)  
✅ **Multi-Agent Critique**: All 4 specialist agents return valid structured JSON responses  
⚠️ **Veo Integration**: API not enabled in test project (requires Google Cloud setup)

## Notes

- These tests make **real API calls** and consume quota
- Test execution time: ~30 seconds (includes network latency)
- Tests validate API connectivity, authentication, prompt structure, and response parsing
- No mocking is used - all responses come directly from Google AI Studio

