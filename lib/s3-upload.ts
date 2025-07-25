export async function uploadToS3(file: File, url: string) {
  await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
} 