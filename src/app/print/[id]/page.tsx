'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrintReceipt() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        fetch(`/api/orders/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Order not found');
                return res.json();
            })
            .then((data) => {
                setOrder(data);
                // Delay print slightly to ensure DOM is ready
                setTimeout(() => {
                    window.print();
                }, 500);
            })
            .catch((err) => setError(err.message));
    }, [id]);

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    if (!order) {
        return <div className="p-8 text-center">Loading receipt...</div>;
    }

    const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;

    return (
        <div className="w-[80mm] mx-auto p-4 text-sm bg-white text-black print:p-0 print:m-0 print:w-auto font-mono">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0cm;
            padding: 10px;
          }
        }
      `}} />
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase">Eatya Now</h1>
                <p className="text-xs">Kattangal, Kerala</p>
                <p className="text-xs">GSTIN: 32XXXXX0000X1Z5</p>
                <p className="text-xs">Tel: (555) 123-4567</p>
            </div>

            <div className="border-t border-b border-dashed border-black py-2 mb-4 space-y-1">
                <div className="flex justify-between items-center">
                    <span className="font-bold">TOKEN #</span>
                    <span className="font-bold text-xl">{order.token_number || order.id.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                {order.customerName && (
                    <div className="flex justify-between">
                        <span>Customer</span>
                        <span>{order.customerName}</span>
                    </div>
                )}
            </div>

            <table className="w-full mb-4">
                <thead>
                    <tr className="border-b border-black text-left">
                        <th className="pb-1 w-8">Qty</th>
                        <th className="pb-1">Item</th>
                        <th className="pb-1 text-right">Amt</th>
                    </tr>
                </thead>
                <tbody className="align-top">
                    {order.items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-dashed border-gray-300 last:border-0">
                            <td className="py-1">{item.quantity}</td>
                            <td className="py-1 break-words pr-2">{item.name}</td>
                            <td className="py-1 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-black pt-2 mb-6 text-sm">
                <div className="flex justify-between mb-1">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>CGST (2.5%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>SGST (2.5%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-dashed border-gray-400 pt-1 mt-1">
                    <span>GRAND TOTAL</span>
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            <div className="text-center text-xs">
                <p>Thank you for your order!</p>
                <p>Please come again</p>
            </div>

            {/* Utility to close window manually if auto-close isn't desired, but typically cashiers just leave it or close it */}
            <div className="mt-8 text-center print:hidden border-t pt-4 text-gray-400">
                <p>Not printing automatically?</p>
                <button onClick={() => window.print()} className="mt-2 px-4 py-2 bg-black text-white rounded">Print Receipt</button>
            </div>
        </div>
    );
}
