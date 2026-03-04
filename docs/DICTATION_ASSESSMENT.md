# Dictation (Speech-to-Text) – Assessment & Implementation

## What we built

1. **Browser recording** – User clicks “Dictate”, we request microphone access and use the **MediaRecorder** API to record audio. On “Stop”, we get a Blob (typically `audio/webm`).
2. **Upload** – The Blob is sent to our backend as `multipart/form-data` to **`POST /api/transcribe`**.
3. **Transcription** – The backend calls **OpenAI Whisper** (if `OPENAI_API_KEY` is set) and returns the text. The client appends it to the essay.
4. **Upload file** – Same flow: user picks an audio file; we send it to `/api/transcribe` and append the result.

So: **record → save (as Blob) → send to API → transcribe → show text** is implemented end-to-end. No third-party front-end library is required for recording; the browser APIs are enough.

---

## How easy is it?

| Step | Difficulty | Notes |
|------|------------|--------|
| **Record in browser** | Easy | `navigator.mediaDevices.getUserMedia({ audio: true })` + `MediaRecorder`. Well supported in modern browsers. |
| **Save / send audio** | Easy | `Blob` from `MediaRecorder.ondataavailable`; send with `FormData` in a `fetch` to our API. |
| **Transcribe on server** | Easy with Whisper | One HTTP POST to OpenAI: `https://api.openai.com/v1/audio/transcriptions` with the file. We use this by default. |
| **Clova** | Medium | Clova Speech has a REST API (Naver Cloud). Short-sentence STT: ~60 s max; long-sentence for longer audio. **Language codes**: Kor, Eng, Jpn, Chn — **no Bulgarian**. For Bulgarian you’d need Whisper or another provider. |
| **Third-party libs** | Optional | For WAV in the browser you can use e.g. `extendable-media-recorder` + WAV encoder. Not required for our current flow: we send WebM to the backend and Whisper accepts it. |

**Conclusion:** Dictation is **straightforward**. The only real decision is which transcription service to use. We implemented **Whisper** because it’s simple (one API, good docs, many languages including Bulgarian). Clova is viable for Korean/English but not for Bulgarian.

---

## Options going forward

1. **Keep Whisper (current)**  
   - Set `OPENAI_API_KEY` in `.env`.  
   - Works for English and Bulgarian (and others).  
   - Cost: pay per minute of audio.

2. **Switch to Clova**  
   - Use Clova Speech REST API from our backend (replace or add a branch in `/api/transcribe`).  
   - Good for Korean/English; **not** for Bulgarian.  
   - You’d need Naver Cloud account and API key.

3. **Drop dictation**  
   - Remove the Dictate and Upload-audio buttons; keep only the text area.  
   - No API cost, no microphone permission; simpler for users who only type.

4. **Third-party library**  
   - Only needed if you want e.g. client-side WAV conversion or a different recording UX.  
   - For “record → send to our API → get text”, the current implementation is enough.

---

## Security and limits

- **Auth** – `/api/transcribe` requires a valid session (same as rest of app).
- **File size** – Request body limited to 25 MB (Whisper’s limit).
- **Secrets** – `OPENAI_API_KEY` (or any other STT key) must stay on the server and in env vars, never in the client.

---

## Enabling transcription

Add to `.env`:

```env
OPENAI_API_KEY=sk-...
```

Restart the dev server. Dictate and “Upload audio” will then return real transcriptions. Without this key, the API responds with a clear “Transcription not configured” message so the UI can show a hint.
