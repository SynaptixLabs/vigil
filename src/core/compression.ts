/**
 * @file compression.ts
 * @description Utilities for compressing and decompressing JSON objects
 * using the native CompressionStream and DecompressionStream APIs.
 */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function compressEvents(events: unknown[]): Promise<string> {
  const jsonStr = JSON.stringify(events);
  const stream = new Response(jsonStr).body;
  if (!stream) throw new Error('Failed to create stream');
  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
  const response = new Response(compressedStream);
  const arrayBuffer = await response.arrayBuffer();
  return arrayBufferToBase64(arrayBuffer);
}

export async function decompressEvents(base64: string): Promise<unknown[]> {
  const arrayBuffer = base64ToArrayBuffer(base64);
  const stream = new Response(arrayBuffer).body;
  if (!stream) throw new Error('Failed to create stream');
  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  const response = new Response(decompressedStream);
  const jsonStr = await response.text();
  return JSON.parse(jsonStr);
}
