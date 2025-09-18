"use client";

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarCheck, Settings, ArrowLeft, CalendarPlus, Landmark, FileSignature, Briefcase, Activity, Youtube, Home, Wallet, Cog, DollarSign, Clipboard, MicVocal, GanttChart, UserCog, Tag } from "lucide-react";
import ClientManagement, { Client, Reward } from "@/components/admin/client-management";
import ContentManagement, { initialContent as iContent, Content } from "@/components/admin/content-management";
import BookingSchedule, { Booking } from "@/components/admin/booking-schedule";
import SiteSettings from "@/components/admin/site-settings";
import EventManagement, { AppEvent } from "@/components/admin/event-management";
import FinancialManagement, { Transaction } from "@/components/admin/financial-management";
import ContractManagement, { Contract } from "@/components/admin/contract-management";
import ActivityLog, { ClientActivity } from "@/components/admin/activity-log";
import PlatformManagement, { Payout, initialPayouts as iPayouts } from "@/components/admin/platform-management";
import FixedCostsManagement, { FixedCost } from "@/components/admin/fixed-costs-management";
import PricingSettings from "@/components/admin/pricing-settings";
import HumanResourcesManagement, { Employee } from "@/components/admin/human-resources-management";
import OrgChart from "@/components/admin/org-chart";
import { format, parseISO } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, updateDoc, doc, addDoc, deleteDoc, Timestamp, orderBy } from "firebase/firestore";
import type { Subscriber } from "@/components/admin/user-management";


type AdminView = "dashboard" | "clients" | "content" | "bookings" | "settings" | "events" | "financial" | "contracts" | "activities" | "platforms" | "fixed-costs" | "pricing" | "hr" | "org-chart";

export type { Contract, Payout };

export type AdminHubProps = {
  content: Content[];
  onAddContent: (content: Omit<Content, 'id'>) => Promise<void>;
  onUpdateContent: (id: string, content: Partial<Omit<Content, 'id'>) => Promise<void>;
  onDeleteContent: (id: string) => Promise<void>;
  events: AppEvent[];
  onAddEvent: (event: Omit<AppEvent, 'id'>) => void;
  onUpdateEvent: (id: string, event: Partial<Omit<AppEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, newStatus: Booking['status']) => void;
  onAddBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  subscribers: Subscriber[];
  onAddSubscriber: (subscriber: Omit<Subscriber, 'id'>) => Promise<void>;
  onUpdateSubscriber: (id: string, subscriber: Partial<Omit<Subscriber, 'id'>) => Promise<void>;
  onDeleteSubscriber: (id: string) => Promise<void>;
  employees: Employee[];
  onAddEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
  onUpdateEmployee: (id: string, employeeData: Partial<Omit<Employee, 'id'>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  onUpdateContract: (id: string, data: Partial<Omit<Contract, 'id'>) => Promise&#x
