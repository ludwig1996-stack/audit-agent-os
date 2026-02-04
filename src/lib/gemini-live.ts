"use client";

/**
 * Gemini Live Service for Real-time Voice Auditing
 * Handles PCM streaming (16-bit, 16kHz) over WebSocket.
 */
export class GeminiLiveService {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private processor: ScriptProcessorNode | null = null;
    private stream: MediaStream | null = null;

    constructor(private apiKey: string, private onEvent: (event: any) => void) { }

    async start() {
        // In a real implementation, we would connect to:
        // wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BiDiGenerateContent
        // For this demo, we simulate the connection and event handling.

        console.log("Starting Gemini Live Audit Session...");

        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(this.stream);

            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            this.processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert to PCM16
                const pcm16 = this.floatToPcm16(inputData);
                this.sendAudio(pcm16);
            };

            this.onEvent({ type: 'status', message: 'SESSION_ACTIVE' });
        } catch (error) {
            console.error("Failed to start voice session:", error);
            this.onEvent({ type: 'error', message: 'MIC_ACCESS_DENIED' });
        }
    }

    private floatToPcm16(float32Array: Float32Array): Int16Array {
        const pcm16 = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const val = Math.max(-1, Math.min(1, float32Array[i]));
            pcm16[i] = val < 0 ? val * 0x8000 : val * 0x7FFF;
        }
        return pcm16;
    }

    private sendAudio(data: Int16Array) {
        // Simulation: Randomly flag 'internal control weaknesses'
        if (Math.random() > 0.995) {
            this.onEvent({
                type: 'finding',
                data: {
                    type: 'RISK',
                    title: 'Voice Detected: Control Gap',
                    detail: 'Auditor mentioned lack of segregation of duties during interview.'
                }
            });
        }
    }

    stop() {
        this.stream?.getTracks().forEach(track => track.stop());
        this.processor?.disconnect();
        this.audioContext?.close();
        console.log("Voice session terminated.");
    }
}
