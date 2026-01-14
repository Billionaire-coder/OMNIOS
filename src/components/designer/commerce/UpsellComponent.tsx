"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

export function UpsellComponent() {
    const { state, addToCart } = useProjectStore();
    const { items } = state.cart;

    // Logic: Only show upsells if cart has items but value is low? 
    // Or simpler: Always show items NOT in cart.
    // For Demo: We'll show a hardcoded list of "Frequently Bought Together" items
    // excluding ones already in the cart.

    const upsellProducts = [
        { id: 'up_1', name: 'Pro Warranty', price: 29.99, image: 'https://placehold.co/100x100/111/444?text=Shield', type: 'digital' as const },
        { id: 'up_2', name: 'Gift Wrap', price: 5.00, image: 'https://placehold.co/100x100/333/666?text=Gift', type: 'physical' as const },
        { id: 'up_3', name: 'Premium Support', price: 99.00, image: 'https://placehold.co/100x100/222/555?text=Support', type: 'subscription' as const },
    ];

    const availableUpsells = upsellProducts.filter(p => !items.find(i => i.productId === p.id));

    if (items.length === 0 || availableUpsells.length === 0) return null;

    return (
        <div style={{
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginTop: '20px'
        }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                You Might Also Like
            </h4>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
                {availableUpsells.map(product => (
                    <motion.div
                        key={product.id}
                        whileHover={{ y: -5 }}
                        style={{
                            minWidth: '160px',
                            backgroundColor: '#111',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #222',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ height: '100px', backgroundColor: '#222' }}>
                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{product.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>${product.price.toFixed(2)}</div>
                            <button
                                onClick={() => addToCart({ productId: product.id, name: product.name, price: product.price, image: product.image })}
                                style={{
                                    marginTop: 'auto',
                                    padding: '6px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Plus size={12} /> Add
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
