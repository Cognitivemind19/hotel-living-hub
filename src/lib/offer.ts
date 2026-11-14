import site from '../data/site.json';

/** Percentage off for anything booked or ordered through the website. */
export const discount = site.onlineDiscount;

export const withDiscount = (price: number) => Math.round(price * (1 - discount / 100));

export const inr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
