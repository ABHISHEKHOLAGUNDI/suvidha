import React from 'react';
import { TouchButton } from '../ui/TouchButton';
import { Printer } from 'lucide-react';

interface ThermalReceiptProps {
    ticketId: string;
    name: string;
    category: string;
    onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ ticketId, name, category, onClose }) => {
    const handlePrint = () => {
        window.print();
        // In a real kiosk, this would send commands to the thermal printer
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-[320px] p-0 shadow-2xl relative animate-in fade-in zoom-in duration-300">

                {/* Thermal Paper Styling */}
                <div className="p-6 font-mono text-sm uppercase tracking-wider text-center border-b-[3px] border-dashed border-slate-300">

                    <div className="mb-4">
                        <span className="text-2xl font-black block mb-1">CIVIC KIOSK</span>
                        <span className="text-xs">Smart City Governance</span>
                    </div>

                    <div className="my-4 border-t border-b border-black py-2">
                        <span className="block text-3xl font-black mb-1">TOKEN</span>
                        <span className="block text-xl font-bold">{ticketId}</span>
                    </div>

                    <div className="text-left space-y-2 mb-6">
                        <div className="flex justify-between">
                            <span>DATE:</span>
                            <span>{new Date().toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TIME:</span>
                            <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="border-t border-dashed border-slate-400 my-2" />
                        <div>
                            <span className="block text-slate-500 text-xs text-left mb-1">APPLICANT</span>
                            <span className="block font-bold">{name}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs text-left mb-1">CATEGORY</span>
                            <span className="block font-bold">{category}</span>
                        </div>
                    </div>

                    <div className="mt-8 mb-4">
                        <span className="block text-xs mb-1">Keep this receipt safe</span>
                        <span className="block text-xs">Track Status Online</span>
                    </div>

                    <div className="font-barcode text-4xl text-center opacity-80 my-2">
                        ||| || ||| | ||
                    </div>
                </div>

                {/* User Actions (Not Printed) */}
                <div className="p-4 bg-slate-100 flex flex-col gap-3 print:hidden">
                    <TouchButton onClick={handlePrint} variant="primary" className="w-full">
                        <Printer className="mr-2" size={20} /> Print Receipt
                    </TouchButton>
                    <TouchButton onClick={onClose} variant="outline" className="w-full">
                        Close
                    </TouchButton>
                </div>
            </div>
        </div>
    );
};
