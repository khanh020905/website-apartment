import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Download, RefreshCw, ExternalLink, QrCode, 
  Copy, Check, X 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';

interface QRManagerProps {
  buildingId: string;
  buildingName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRManager = ({ 
  buildingId, buildingName, isOpen, onClose 
}: QRManagerProps) => {
  const [qr, setQr] = useState<{ code: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadQR();
    }
  }, [isOpen, buildingId]);

  const loadQR = async () => {
    setLoading(true);
    const { data } = await api.get<{ qr: { code: string } | null }>(`/api/qr/building/${buildingId}`);
    if (data?.qr) setQr(data.qr);
    else setQr(null);
    setLoading(false);
  };

  const generateQR = async () => {
    setLoading(true);
    const { data } = await api.post<{ qr: { code: string } }>(`/api/qr/generate`, { building_id: buildingId });
    if (data?.qr) setQr(data.qr);
    setLoading(false);
  };

  const regenerateQR = async () => {
    if (!confirm('Cảnh báo: Mã QR cũ sẽ mất hiệu lực. Khách cũ đã quét mã cũ sẽ không xem được nữa. Tiếp tục?')) return;
    setLoading(true);
    const { data } = await api.post<{ qr: { code: string } }>(`/api/qr/regenerate`, { building_id: buildingId });
    if (data?.qr) setQr(data.qr);
    setLoading(false);
  };

  const downloadPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR-B-${buildingName.replace(/\s+/g, '-')}.png`;
    link.href = url;
    link.click();
  };

  const statusUrl = `${window.location.origin}/qr/${qr?.code}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(statusUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <QrCode className="w-6 h-6 text-indigo-500" />
              Mã QR Tòa nhà
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Trang chủ quản tòa: {buildingName}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-colors shadow-sm cursor-pointer">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-10 h-10 text-slate-200 animate-spin mx-auto mb-4" />
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Đang tải Intelligence...</p>
            </div>
          ) : qr ? (
            <div className="w-full space-y-10 animate-in fade-in zoom-in duration-500">
              {/* QR Container */}
              <div className="flex flex-col items-center">
                <div className="p-6 bg-white border-4 border-slate-50 rounded-[48px] shadow-2xl shadow-indigo-900/5 relative group">
                  <div ref={canvasRef} className="p-4 bg-white rounded-3xl overflow-hidden border border-slate-100">
                    <QRCodeCanvas 
                      value={statusUrl} 
                      size={240} 
                      level="H" 
                      includeMargin={false}
                      imageSettings={{
                        src: "/favicon.ico", // or a home logo
                        x: undefined, y: undefined, height: 40, width: 40, excavate: true,
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-[48px] pointer-events-none">
                    <button className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl pointer-events-auto cursor-pointer" onClick={downloadPNG}>
                      <Download className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <p className="mt-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Scan to view room status</p>
              </div>

              {/* URL Section */}
              <div className="space-y-4">
                <div className="relative group">
                  <input 
                    readOnly 
                    value={statusUrl} 
                    className="w-full h-14 pl-6 pr-14 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 outline-none"
                  />
                  <button onClick={copyUrl} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-sm cursor-pointer">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={downloadPNG} className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all cursor-pointer">
                    <Download className="w-4 h-4" /> Tải về PNG
                  </button>
                  <button onClick={regenerateQR} className="h-14 px-6 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 transition-colors cursor-pointer" title="Làm mới QR">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <a href={statusUrl} target="_blank" className="h-14 px-6 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center hover:bg-emerald-100 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/30">
                <p className="text-[10px] font-bold text-indigo-400 leading-relaxed text-center italic">
                  * Khách có thể quét mã này bằng Zalo, Camera để xem trạng thái phòng thời gian thực mà không cần tạo tài khoản.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-14 text-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2">Chưa có mã QR</h4>
              <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto mb-10 leading-relaxed">Mỗi tòa nhà cần một định danh duy nhất để khách xem trạng thái phòng.</p>
              <button 
                onClick={generateQR}
                className="px-10 py-4 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-900/20 hover:scale-105 transition-transform cursor-pointer"
              >
                Tạo mã QR ngay
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
