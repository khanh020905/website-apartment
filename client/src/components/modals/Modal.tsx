import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	footer?: ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeClasses = {
	"sm": "max-w-md",
	"md": "max-w-lg",
	"lg": "max-w-2xl",
	"xl": "max-w-4xl",
	"2xl": "max-w-5xl",
};

const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) => {
	// Prevent scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div
					className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/40 transition-all"
					onClick={handleBackdropClick}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
						className={`w-full ${sizeClasses[size]} bg-white rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] border border-slate-100 overflow-hidden`}
					>
						{/* Header */}
						<div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
							<h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
							<button
								onClick={onClose}
								className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 active:scale-95 cursor-pointer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">{children}</div>

						{/* Footer */}
						{footer && (
							<div className="px-8 py-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-end gap-3 shrink-0">
								{footer}
							</div>
						)}
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};

export default Modal;
