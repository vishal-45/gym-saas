import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GymContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function GymProvider({ children }) {
  const navigate = useNavigate();
  // Authentication State
  const [tenant, setTenant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gym_auth_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Members DB State
  const [members, setMembers] = useState([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  // Advanced States
  const [payments, setPayments] = useState([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [vault, setVault] = useState([]);
  const [isVaultLoading, setIsVaultLoading] = useState(false);

  // Trainers & Staff State
  const [trainers, setTrainers] = useState([]);
  const [isTrainersLoading, setIsTrainersLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);


  // ----------------------------------------------------
  // Authentication API
  // ----------------------------------------------------
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication offline');
      
      localStorage.setItem('gym_auth_token', data.token);
      setToken(data.token);
      setTenant(data.tenant);
      return { success: true, role: data.tenant.role };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const memberLogin = async (email, password, tenantId = null) => {
    try {
      const res = await fetch(`${API_URL}/auth/member-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication offline');
      
      // If the backend says we need to pick a gym
      if (data.requiresSelection) {
        return { success: true, requiresSelection: true, options: data.options };
      }

      localStorage.setItem('gym_auth_token', data.token);
      setToken(data.token);
      setTenant(data.tenant); 
      return { success: true, role: data.tenant.role };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const registerTenant = async (name, email, password, tier) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, tier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration offline');

      return await login(email, password);
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const adminProvisionTenant = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Provisioning failed');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const staffLogin = async (email, password, mode) => {
    try {
      const endpoint = mode === 'trainer' ? '/auth/trainer-login' : '/auth/staff-login';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication offline');
      
      localStorage.setItem('gym_auth_token', data.token);
      setToken(data.token);
      setTenant(data.tenant);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('gym_auth_token');
    setToken(null);
    setTenant(null);
    setMembers([]);
  };

  // ----------------------------------------------------
  // Members API CRUD
  // ----------------------------------------------------
  const loadMembers = async () => {
    setIsMembersLoading(true);
    try {
      const res = await fetch(`${API_URL}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rawData = await res.json();
      
      // Inject Avatar Initial calculations dynamically for the UI
      const processedMembers = rawData.map(m => ({
        ...m,
        initial: m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
      }));

      setMembers(processedMembers);
    } catch (err) {
      console.error("Failed to fetch live members");
    }
    setIsMembersLoading(false);
  };

  const addMember = async (memberData) => {
    try {
      const res = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(memberData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to save member to database.');
      
      // Real-time UI refresh bypassing another fetch
      setMembers([{
        ...data,
        initial: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
      }, ...members]);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateMember = async (id, memberData) => {
    try {
      const res = await fetch(`${API_URL}/members/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(memberData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to update member.');
      
      const updatedMembers = members.map(m => {
        if(m.id === id) {
          return { ...data, initial: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U' };
        }
        return m;
      });
      setMembers(updatedMembers);
      return { success: true };
    } catch(err) {
      return { success: false, error: err.message };
    }
  };

  const deleteMember = async (id) => {
    try {
      const res = await fetch(`${API_URL}/members/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to terminate member.');
      
      setMembers(members.filter(m => m.id !== id));
      return { success: true };
    } catch(err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // Classes & Scheduling API
  // ----------------------------------------------------
  const [classes, setClasses] = useState([]);
  const [isClassesLoading, setIsClassesLoading] = useState(false);

  const loadClasses = async () => {
    setIsClassesLoading(true);
    try {
      const res = await fetch(`${API_URL}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes");
    }
    setIsClassesLoading(false);
  };

  const addClass = async (classData) => {
    try {
      const res = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(classData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule class.');
      
      setClasses([data, ...classes]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteClass = async (id) => {
    try {
      const res = await fetch(`${API_URL}/classes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete class.');
      setClasses(classes.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // Booking API (Member Only)
  // ----------------------------------------------------
  const [myBookings, setMyBookings] = useState([]);

  const bookClass = async (classId) => {
    try {
      const res = await fetch(`${API_URL}/classes/${classId}/book`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed.');
      
      await fetchMyBookings(); // Refresh bookings stack
      await loadClasses();    // Refresh class capacity stack
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMyBookings(data);
    } catch (err) {
      console.error("Failed to fetch my bookings");
    }
  };

  // ----------------------------------------------------
  // Super Admin Powers API
  // ----------------------------------------------------
  const fetchAllTenants = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/tenants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return { error: 'Access Denied or Server Error' };
      return await res.json();
    } catch (err) {
      return { error: 'Backend Connection Offline' };
    }
  };

  const toggleTenantStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/tenants/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  const impersonateTenant = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/tenants/${id}/impersonate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impersonation failed');

      setToken(data.token);
      localStorage.setItem('gym_auth_token', data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // Dynamic MRR Mathematics
  // ----------------------------------------------------
  const calculateDashboardMetrics = () => {
    let totalRevenue = 0;
    members.forEach(m => {
      if (m.plan === 'Premium Pass') totalRevenue += 2500;
      if (m.plan === 'Basic Month') totalRevenue += 1200;
      if (m.plan === 'Annual Pro') totalRevenue += 1500; // Monthly equivalent (approx 18000/yr)
    });

    return {
      totalRevenue,
      churnRate: '2.4%', // Placeholder for future data layer
    };
  };

  // ----------------------------------------------------
  // Payments & Billing API
  // ----------------------------------------------------
  const fetchPaymentHistory = async () => {
    setIsPaymentsLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments");
    }
    setIsPaymentsLoading(false);
  };

  const createPaymentOrder = async (amount, memberId) => {
    try {
      const res = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount, memberId })
      });
      return await res.json();
    } catch (err) {
      return { error: err.message };
    }
  };

  const verifyPayment = async (verificationData) => {
    try {
      const res = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(verificationData)
      });
      const data = await res.json();
      if(data.success) fetchPaymentHistory();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const recordOfflinePayment = async (paymentData) => {
    try {
      const res = await fetch(`${API_URL}/payments/offline`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(paymentData)
      });
      const data = await res.json();
      if(data.success) fetchPaymentHistory();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // Attendance API
  // ----------------------------------------------------
  const checkInMember = async (memberId) => {
    try {
      const res = await fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ memberId })
      });
      const data = await res.json();
      if(data.success) loadAttendance();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loadAttendance = async () => {
    try {
      const res = await fetch(`${API_URL}/attendance/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAttendance(data);
    } catch (err) {
      console.error("Attendance fetch failed");
    }
  };

  // ----------------------------------------------------
  // The Vault (Resource Library) API
  // ----------------------------------------------------
  const fetchVaultResources = async () => {
    setIsVaultLoading(true);
    try {
      const res = await fetch(`${API_URL}/vault`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setVault(data);
    } catch (err) {
      console.error("Vault fetch failed");
    }
    setIsVaultLoading(false);
  };

  const addVaultResource = async (resourceData) => {
    try {
      const res = await fetch(`${API_URL}/vault`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(resourceData)
      });
      const data = await res.json();
      setVault([data, ...vault]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteVaultResource = async (id) => {
    try {
      const res = await fetch(`${API_URL}/vault/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) setVault(vault.filter(v => v.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // Wellness API
  // ----------------------------------------------------
  const fetchMyWorkouts = async (memberId) => {
    try {
      const res = await fetch(`${API_URL}/wellness/workouts/${memberId}`, { headers: { 'Authorization': `Bearer ${token}` }});
      return await res.json();
    } catch (err) { return []; }
  };

  const fetchMyDiets = async (memberId) => {
    try {
      const res = await fetch(`${API_URL}/wellness/diets/${memberId}`, { headers: { 'Authorization': `Bearer ${token}` }});
      return await res.json();
    } catch (err) { return []; }
  };

  const fetchMyProgress = async (memberId) => {
    try {
      const res = await fetch(`${API_URL}/wellness/progress/${memberId}`, { headers: { 'Authorization': `Bearer ${token}` }});
      return await res.json();
    } catch (err) { return []; }
  };

  const logProgress = async (data) => {
    try {
      const res = await fetch(`${API_URL}/wellness/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) { return { error: err.message }; }
  };

  // ----------------------------------------------------
  // Trainers API CRUD
  // ----------------------------------------------------
  const loadTrainers = async () => {
    setIsTrainersLoading(true);
    try {
      const res = await fetch(`${API_URL}/trainers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTrainers(data.map(t => ({
        ...t,
        initial: t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'T'
      })));
    } catch (err) {
      console.error("Failed to fetch trainers");
    }
    setIsTrainersLoading(false);
  };

  const addTrainer = async (trainerData) => {
    try {
      const res = await fetch(`${API_URL}/trainers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(trainerData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create trainer.');
      setTrainers([{ ...data, initial: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'T' }, ...trainers]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateTrainer = async (id, trainerData) => {
    try {
      const res = await fetch(`${API_URL}/trainers/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(trainerData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update trainer.');
      setTrainers(trainers.map(t => t.id === id ? { ...data, initial: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'T' } : t));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteTrainer = async (id) => {
    try {
      const res = await fetch(`${API_URL}/trainers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete trainer.');
      setTrainers(trainers.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // Staff (Team Members) API CRUD
  // ----------------------------------------------------
  const loadStaff = async () => {
    setIsStaffLoading(true);
    try {
      const res = await fetch(`${API_URL}/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStaff(data.map(s => ({
        ...s,
        initial: s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'S'
      })));
    } catch (err) {
      console.error("Failed to fetch staff");
    }
    setIsStaffLoading(false);
  };

  const addStaff = async (staffData) => {
    try {
      const res = await fetch(`${API_URL}/staff`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(staffData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff member.');
      setStaff([{ ...data, initial: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'S' }, ...staff]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateStaff = async (id, staffData) => {
    try {
      const res = await fetch(`${API_URL}/staff/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(staffData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update staff member.');
      setStaff(staff.map(s => s.id === id ? { ...data, initial: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'S' } : s));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteStaff = async (id) => {
    try {
      const res = await fetch(`${API_URL}/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete staff member.');
      setStaff(staff.filter(s => s.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // Membership Plans API CRUD
  // ----------------------------------------------------
  const loadPlans = async () => {
    setIsPlansLoading(true);
    try {
      const res = await fetch(`${API_URL}/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      console.error("Failed to fetch plans");
    }
    setIsPlansLoading(false);
  };

  const addPlan = async (planData) => {
    try {
      const res = await fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(planData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create plan.');
      setPlans([data, ...plans]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updatePlan = async (id, planData) => {
    try {
      const res = await fetch(`${API_URL}/plans/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(planData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update plan.');
      setPlans(plans.map(p => p.id === id ? data : p));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deletePlan = async (id) => {
    try {
      const res = await fetch(`${API_URL}/plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete plan.');
      setPlans(plans.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // Lead Management API CRUD
  // ----------------------------------------------------
  const loadLeads = async () => {
    setIsLeadsLoading(true);
    try {
      const res = await fetch(`${API_URL}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setLeads(data);
    } catch (err) {
      console.error("Lead Load Failure", err);
    } finally {
      setIsLeadsLoading(false);
    }
  };

  const addLead = async (leadData) => {
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leadData)
      });
      const data = await res.json();
      if (res.ok) {
        setLeads([data, ...leads]);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: "Network transformation failure." };
    }
  };

  const updateLead = async (id, updateData) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? data : l));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: "Network transformation failure." };
    }
  };

  const deleteLead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const decodedPayload = JSON.parse(atob(token.split('.')[1]));
        setTenant({ 
          id: decodedPayload.id, 
          name: decodedPayload.name, 
          tier: decodedPayload.tier, 
          role: decodedPayload.role,
          plan: decodedPayload.plan,
          tenantId: decodedPayload.tenantId
        });
      } catch (err) {
        logout();
      }
    }
    setIsLoading(false);
  }, [token]);

  // Load Real Members & Classes from SQLite on Authentication
  useEffect(() => {
    if (tenant && tenant.role !== 'SUPER_ADMIN') {
      loadMembers();
      loadClasses();
      fetchPaymentHistory();
      loadAttendance();
      fetchVaultResources();
      loadTrainers();
      loadStaff();
      loadPlans();
      loadLeads();
    }
  }, [tenant]);

  return (
    <GymContext.Provider value={{ 
      tenant, token, isLoading, login, memberLogin, staffLogin, registerTenant, adminProvisionTenant, impersonateTenant, logout, 
      fetchAllTenants, toggleTenantStatus, 
      members, isMembersLoading, addMember, updateMember, deleteMember, dashboardMetrics: calculateDashboardMetrics(), 
      classes, isClassesLoading, addClass, deleteClass, bookClass, myBookings, fetchMyBookings,
      payments, isPaymentsLoading, createPaymentOrder, verifyPayment, recordOfflinePayment, fetchPaymentHistory,
      attendance, checkInMember, loadAttendance,
      vault, isVaultLoading, fetchVaultResources, addVaultResource, deleteVaultResource,
      trainers, isTrainersLoading, addTrainer, updateTrainer, deleteTrainer,
      staff, isStaffLoading, addStaff, updateStaff, deleteStaff,
      plans, isPlansLoading, loadPlans, addPlan, updatePlan, deletePlan,
      leads, isLeadsLoading, loadLeads, addLead, updateLead, deleteLead,
        
        // Wellness Actions
        fetchMemberWellness: async (memberId) => {
            try {
                const [wRes, dRes, pRes] = await Promise.all([
                    fetch(`${API_URL}/wellness/workouts/${memberId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/wellness/diets/${memberId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/wellness/progress/${memberId}`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                return {
                    workouts: await wRes.json(),
                    diets: await dRes.json(),
                    progress: await pRes.json()
                };
            } catch (err) { return { workouts: [], diets: [], progress: [] }; }
        },
        addWorkout: async (data) => {
            const res = await fetch(`${API_URL}/wellness/workouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            return res.ok;
        },
        addDiet: async (data) => {
            const res = await fetch(`${API_URL}/wellness/diets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            return res.ok;
        },
        addProgress: async (data) => {
            const res = await fetch(`${API_URL}/wellness/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            return res.ok;
        },
        // Notifications API
        notifications,
        isNotificationsLoading,
        fetchNotifications: async () => {
            setIsNotificationsLoading(true);
            try {
                const res = await fetch(`${API_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setNotifications(data);
            } catch (err) {
                console.error("Notification fetch failed");
            } finally {
                setIsNotificationsLoading(false);
            }
        },
        markNotificationRead: async (id) => {
            try {
                const res = await fetch(`${API_URL}/notifications/${id}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'Read' } : n));
                }
            } catch (err) {
                console.error("Failed to mark as read");
            }
        },
        sendBroadcast: async (title, message, targetGroup = 'ALL') => {
            try {
                const res = await fetch(`${API_URL}/notifications/broadcast`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ title, message, targetGroup })
                });
                const data = await res.json();
                if (res.ok) {
                    setNotifications([data, ...notifications]);
                    return { success: true };
                }
                return { success: false, error: data.error };
            } catch (err) {
                return { success: false, error: "Communication server offline." };
            }
        },
        sendDirectNotification: async (userId, title, message) => {
            try {
                const res = await fetch(`${API_URL}/notifications/direct`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ userId, title, message })
                });
                const data = await res.json();
                if (res.ok) {
                    setNotifications([data, ...notifications]);
                    return { success: true };
                }
                return { success: false, error: data.error };
            } catch (err) {
                return { success: false, error: "Communication server offline." };
            }
        }
    }}>
      {children}
    </GymContext.Provider>
  );
}

export function useGymContext() {
  return useContext(GymContext);
}
