import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Detector = { detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]> };
type DetectorConstructor = new (options?: { formats?: string[] }) => Detector;

export function QrLogin({ loading, onVerify, onClose }: { loading: boolean; onVerify: (payload: string) => Promise<void>; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (!cameraActive) return;
    const BarcodeDetector = (window as typeof window & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
    if (!BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera QR scanning is not supported in this browser. Use a hardware scanner or paste the code.");
      return;
    }

    let stream: MediaStream | null = null;
    let timer: number | undefined;
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    void navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
      .then((media) => {
        stream = media;
        if (!videoRef.current) return;
        videoRef.current.srcObject = media;
        timer = window.setInterval(() => {
          const video = videoRef.current;
          if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || loading) return;
          void detector.detect(video as unknown as ImageBitmapSource).then((codes) => {
            if (codes[0]?.rawValue) void onVerify(codes[0].rawValue);
          }).catch(() => undefined);
        }, 350);
      })
      .catch(() => setCameraError("We could not access your camera. Check browser permissions and try again."));

    return () => {
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraActive, loading, onVerify]);

  return <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><QrCode className="size-4 text-primary" /><p className="text-sm font-semibold">QR code login</p></div><p className="mt-1 text-xs leading-5 text-muted-foreground">Scan an AssetFlow login QR code to sign in securely.</p></div><button type="button" onClick={onClose} aria-label="Close QR login" className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button></div>{!cameraActive && <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => { setCameraError(null); setCameraActive(true); }}><Camera className="size-4" /> Open camera scanner</Button>}{cameraActive && <div className="mt-4 overflow-hidden rounded-lg bg-black"><video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" /></div>}{cameraError && <p className="mt-3 text-xs text-destructive">{cameraError}</p>}<form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (manualCode.trim()) void onVerify(manualCode); }}><Input value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Scanner input or QR login URL" aria-label="QR login code" /><Button type="submit" size="icon" disabled={loading || !manualCode.trim()}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <QrCode className="size-4" />}</Button></form></div>;
}
