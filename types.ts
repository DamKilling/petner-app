// Fix: Add missing import for React to resolve React.ReactElement type.
import React from 'react';

export type Page = 'Home' | 'Services' | 'Shop' | 'Community' | 'Profile' | 'Upload' | 'PostDetail' | 'PetAICompanion' | 'Memorials' | 'MemorialDetail' | 'CreateMemorial' | 'AboutUs' | 'ServiceDetail' | 'Orders' | 'OrderDetail' | 'Notifications' | 'Settings' | 'Invoices' | 'Jobs' | 'StoreApplication' | 'PetCredentials';

export interface Comment {
    user: string;
    avatar: string;
    text: string;
}

export interface Post {
    id: number;
    emoji: string;
    title: string;
    user: string;
    userId: string;
    likes: number;
    likedBy: string[];
    avatar: string;
    image?: string | null;
    comments: Comment[];
}

export interface Product {
    id: number;
    icon: React.ReactElement;
    name: string;
    desc: string;
    price: number;
    tag: string;
    tagColor: string;
}

export interface Tribute {
    id: number;
    user: string;
    text: string;
    date: string;
}

export interface Memorial {
  id: number;
  petName: string;
  petAvatar: string;
  birthday: string;
  adoptionDay: string;
  favoriteToys: string;
  stories: string;
  photos: string[];
  candles: number;
  tributes: Tribute[];
}

export interface Order {
    id: string;
    date: string;
    title: string;
    price: number;
    status: 'Pending Payment' | 'In Service' | 'Pending Confirm' | 'Completed' | 'Cancelled';
    type: 'Service' | 'Product';
    petName?: string;
    desc?: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'system' | 'order' | 'community';
}

export interface UserSettings {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
    privacy: 'public' | 'friends' | 'private';
}

export interface Job {
    id: number;
    title: string;
    location: string;
    type: string;
    salary: string;
    description: string;
}

export interface Invoice {
    id: string;
    orderId: string;
    date: string;
    title: string;
    amount: number;
    status: 'pending' | 'issued';
}

export interface PetCredential {
    id: number;
    petName: string;
    petAvatar: string;
    service: string;
    startDate: string;
    endDate: string;
    certificateUrl?: string;
}

export interface StoreApplication {
    id: number;
    name: string;
    phone: string;
    address: string;
    note: string;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
}