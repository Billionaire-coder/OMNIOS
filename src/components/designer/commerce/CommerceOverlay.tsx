"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Trash2, CreditCard, Lock, Image as ImageIcon } from 'lucide-react';
import { UpsellComponent } from './UpsellComponent';

export function CommerceOverlay() {
    const { state, removeFromCart, toggleCart } = useProjectStore();
    const { items, isOpen, taxTotal, shippingTotal } = state.cart;

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const finalTotal = subtotal + (taxTotal || 0) + (shippingTotal || 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => toggleCart(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000,
                            cursor: 'pointer'
                        }}
                    />

                    {/* Cart Tray */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            width: '400px',
                            height: '100vh',
                            backgroundColor: 'rgba(10, 10, 10, 0.8)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                            zIndex: 1001,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '-20px 0 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <ShoppingBag size={20} color="var(--accent-teal)" />
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '-0.02em', margin: 0 }}>Your Bag</h2>
                                <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', color: '#888' }}>
                                    {items.length}
                                </span>
                            </div>
                            <button
                                onClick={() => toggleCart(false)}
                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            {items.length === 0 ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', gap: '16px' }}>
                                    <ShoppingBag size={48} strokeWidth={1} />
                                    <p style={{ fontSize: '0.9rem' }}>Your bag is empty.</p>
                                    <button
                                        onClick={() => toggleCart(false)}
                                        style={{ padding: '8px 16px', border: '1px solid #333', borderRadius: '4px', color: '#aaa', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {items.map((item) => (
                                        <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                                                        <ImageIcon size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>{item.name}</h3>
                                                    <span style={{ fontSize: '0.9rem', color: 'white' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Qty: {item.quantity}</span>
                                                    {item.type === 'digital' && (
                                                        <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(0, 255, 255, 0.1)', color: 'cyan', border: '1px solid rgba(0, 255, 255, 0.2)' }}>DIGITAL</span>
                                                    )}
                                                    {item.type === 'subscription' && (
                                                        <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255, 0, 255, 0.1)', color: 'magenta', border: '1px solid rgba(255, 0, 255, 0.2)' }}>SUB</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}
                                                >
                                                    <Trash2 size={12} /> REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <UpsellComponent />

                        {/* Footer */}
                        {items.length > 0 && (
                            <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#888' }}>
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#888' }}>
                                        <span>Tax</span>
                                        <span>${(taxTotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#888' }}>
                                        <span>Shipping</span>
                                        <span>${(shippingTotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'white', fontSize: '1rem' }}>Total</span>
                                        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>${finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        backgroundColor: 'var(--accent-teal)',
                                        color: 'black',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    onClick={() => alert("Simulating checkout redirect to Payment Provider...")}
                                >
                                    <CreditCard size={18} />
                                    Checkout Now
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', color: '#444' }}>
                                    <Lock size={12} />
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Checkout</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
