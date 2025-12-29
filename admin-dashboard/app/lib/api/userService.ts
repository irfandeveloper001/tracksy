import api from './client';
import { supabase } from '../config/supabase';

export interface Student {
  id: string;
  email: string;
  name: string;
  student_id: string;
  phone?: string;
  institution?: string;
  route_id?: string;
  route_name?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  email: string;
  name: string;
  driver_id: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  status: 'active' | 'inactive' | 'on_leave';
  bus_id?: string;
  bus_number?: string;
  route_id?: string;
  route_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'viewer';
  status: 'active' | 'inactive';
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserFilters {
  status?: string;
  route_id?: string;
  institution?: string;
  search?: string;
}

export interface UserListResponse<T> {
  users: T[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

class UserService {
  // ========== STUDENT METHODS ==========

  // Get all students
  async getStudents(
    page: number = 1,
    perPage: number = 20,
    filters?: UserFilters
  ): Promise<UserListResponse<Student>> {
    try {
      const params: any = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await api.get('/admin/students', { params });
      const payload = response.data?.data ?? response.data;

      if (payload && Array.isArray(payload.data)) {
        const students = payload.data.map((student: any) => ({
          id: student.id?.toString() || '',
          email: student.email || '',
          name: student.name || '',
          student_id: student.student_id || student.studentId || '',
          phone: student.phone || '',
          institution: student.institution || '',
          route_id: student.route_id?.toString() || '',
          route_name: student.route_name || '',
          status: student.status || 'active',
          created_at: student.created_at || '',
          updated_at: student.updated_at || '',
        }));

        return {
          users: students,
          total: payload.total || 0,
          current_page: payload.current_page || page,
          per_page: payload.per_page || perPage,
          last_page: payload.last_page || 1,
        };
      }

      if (Array.isArray(payload)) {
        const students = payload.map((student: any) => ({
          id: student.id?.toString() || '',
          email: student.email || '',
          name: student.name || '',
          student_id: student.student_id || student.studentId || '',
          phone: student.phone || '',
          institution: student.institution || '',
          route_id: student.route_id?.toString() || '',
          route_name: student.route_name || '',
          status: student.status || 'active',
          created_at: student.created_at || '',
          updated_at: student.updated_at || '',
        }));

        return {
          users: students,
          total: students.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(students.length / perPage) || 1,
        };
      }

      if (payload && Array.isArray(payload.users)) {
        return payload;
      }

      return {
        users: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty students list');
        return {
          users: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get single student
  async getStudentById(studentId: string): Promise<Student> {
    try {
      const response = await api.get(`/admin/students/${studentId}`);
      const payload = response.data?.data ?? response.data;
      const student = payload?.data ?? payload;

      return {
        id: student?.id?.toString() || '',
        email: student?.email || '',
        name: student?.name || '',
        student_id: student?.student_id || student?.studentId || '',
        phone: student?.phone || '',
        institution: student?.institution || '',
        route_id:
          student?.route_id?.toString() ||
          student?.assigned_route_id?.toString() ||
          '',
        route_name:
          student?.route_name ||
          student?.assignedRoute?.name ||
          student?.assigned_route?.name ||
          '',
        status: student?.status || 'active',
        created_at: student?.created_at || '',
        updated_at: student?.updated_at || '',
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Create student
  async createStudent(studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await api.post('/admin/students', studentData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create student');
    }
  }

  // Update student
  async updateStudent(studentId: string, studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await api.put(`/admin/students/${studentId}`, studentData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update student');
    }
  }

  // Delete student
  async deleteStudent(studentId: string): Promise<void> {
    try {
      await api.delete(`/admin/students/${studentId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete student');
    }
  }

  // Update student status
  async updateStudentStatus(
    studentId: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<Student> {
    try {
      const response = await api.patch(`/admin/students/${studentId}/status`, { status });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update student status');
    }
  }

  // Reset student password
  async resetStudentPassword(studentId: string): Promise<void> {
    try {
      await api.post(`/admin/students/${studentId}/reset-password`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  // Get student booking history
  async getStudentBookingHistory(
    studentId: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<any> {
    try {
      const response = await api.get(`/admin/students/${studentId}/bookings`, {
        params: { page, per_page: perPage },
      });
      const payload = response.data?.data ?? response.data;

      if (payload && Array.isArray(payload.data)) {
        const bookings = payload.data.map((booking: any) => ({
          id: booking.id?.toString() || '',
          route_name:
            booking.bus?.currentRoute?.name ||
            booking.bus?.current_route?.name ||
            booking.route_name ||
            '',
          bus_number: booking.bus?.number || booking.bus_number || '',
          start_time: booking.trip?.start_time || booking.start_time || '',
          end_time: booking.trip?.end_time || booking.end_time || '',
          status: booking.status || '',
          trip_date: booking.trip_date || '',
          created_at: booking.created_at || '',
          pickup_location: booking.pickup_location || '',
          dropoff_location: booking.dropoff_location || '',
        }));

        return { bookings, total: payload.total || bookings.length };
      }

      if (Array.isArray(payload)) {
        const bookings = payload.map((booking: any) => ({
          id: booking.id?.toString() || '',
          route_name:
            booking.bus?.currentRoute?.name ||
            booking.bus?.current_route?.name ||
            booking.route_name ||
            '',
          bus_number: booking.bus?.number || booking.bus_number || '',
          start_time: booking.trip?.start_time || booking.start_time || '',
          end_time: booking.trip?.end_time || booking.end_time || '',
          status: booking.status || '',
          trip_date: booking.trip_date || '',
          created_at: booking.created_at || '',
          pickup_location: booking.pickup_location || '',
          dropoff_location: booking.dropoff_location || '',
        }));
        return { bookings, total: bookings.length };
      }

      return { bookings: [], total: 0 };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return { bookings: [], total: 0 };
      }
      return { bookings: [], total: 0 };
    }
  }

  // ========== DRIVER METHODS ==========

  // Get all drivers - Use Laravel backend API (primary source)
  async getDrivers(
    page: number = 1,
    perPage: number = 20,
    filters?: UserFilters
  ): Promise<UserListResponse<Driver>> {
    // Use Laravel backend API (primary source)
    try {
      const params: any = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await api.get('/admin/drivers', { params });
      const backendData = response.data.data || response.data;
      
      // Handle Laravel pagination response format
      if (backendData.data && Array.isArray(backendData.data)) {
        // Laravel paginated response
        const drivers = backendData.data.map((driver: any) => ({
          id: driver.id?.toString() || '',
          email: driver.email || '',
          name: driver.name || '',
          driver_id: driver.driver_id || '',
          phone: driver.phone || '',
          license_number: driver.license_number || '',
          license_expiry: driver.license_expiry || '',
          status: driver.status || 'active',
          bus_id: driver.assigned_bus_id?.toString() || '',
          bus_number:
            driver.assignedBus?.number ||
            driver.assigned_bus?.number ||
            driver.bus?.number ||
            '',
          route_id: driver.assigned_route_id?.toString() || '',
          route_name:
            driver.assignedRoute?.name ||
            driver.assigned_route?.name ||
            driver.route?.name ||
            '',
          created_at: driver.created_at || '',
          updated_at: driver.updated_at || '',
        }));
        
        return {
          users: drivers,
          total: backendData.total || 0,
          current_page: backendData.current_page || page,
          per_page: backendData.per_page || perPage,
          last_page: backendData.last_page || 1,
        };
      } else if (Array.isArray(backendData)) {
        // Simple array response
        const drivers = backendData.map((driver: any) => ({
          id: driver.id?.toString() || '',
          email: driver.email || '',
          name: driver.name || '',
          driver_id: driver.driver_id || '',
          phone: driver.phone || '',
          license_number: driver.license_number || '',
          license_expiry: driver.license_expiry || '',
          status: driver.status || 'active',
          bus_id: driver.assigned_bus_id?.toString() || '',
          bus_number:
            driver.assignedBus?.number ||
            driver.assigned_bus?.number ||
            driver.bus?.number ||
            '',
          route_id: driver.assigned_route_id?.toString() || '',
          route_name:
            driver.assignedRoute?.name ||
            driver.assigned_route?.name ||
            driver.route?.name ||
            '',
          created_at: driver.created_at || '',
          updated_at: driver.updated_at || '',
        }));
        
        return {
          users: drivers,
          total: drivers.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(drivers.length / perPage) || 1,
        };
      }
      
      return {
        users: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty drivers list');
        return {
          users: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get drivers directly from Supabase
  async getDriversFromSupabase(filters?: UserFilters): Promise<Driver[]> {
    try {
      // Query drivers table directly without join (user_profiles relationship may not exist)
      let driversQuery = supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        driversQuery = driversQuery.eq('status', filters.status);
      }

      const { data: driversData, error: driversError } = await driversQuery;

      if (driversError) {
        console.error('❌ Supabase error fetching drivers:', driversError);
        // Return empty array if query fails
        return [];
      }

      // Map Supabase data to Driver interface
      return (driversData || []).map((driver: any) => ({
        id: driver.id,
        email: driver.email || driver.user_id || '',
        name: driver.name || driver.full_name || 'Unknown Driver',
        driver_id: driver.license_number || driver.driver_id || driver.id,
        phone: driver.phone || driver.phone_number,
        license_number: driver.license_number || driver.driver_license,
        status: (driver.status || 'active') as 'active' | 'inactive' | 'on_leave',
        created_at: driver.created_at,
        updated_at: driver.updated_at,
      }));
    } catch (error) {
      console.error('❌ Failed to fetch drivers from Supabase:', error);
      return [];
    }
  }

  // Get single driver
  async getDriverById(driverId: string): Promise<Driver> {
    try {
      const response = await api.get(`/admin/drivers/${driverId}`);
      const payload = response.data?.data ?? response.data;
      const driver = payload?.data ?? payload;

      return {
        id: driver?.id?.toString() || '',
        email: driver?.email || '',
        name: driver?.name || '',
        driver_id: driver?.driver_id || driver?.license_number || '',
        phone: driver?.phone || '',
        license_number: driver?.license_number || '',
        license_expiry: driver?.license_expiry || '',
        status: driver?.status || 'active',
        bus_id:
          driver?.assigned_bus_id?.toString() ||
          driver?.assignedBus?.id?.toString() ||
          driver?.assigned_bus?.id?.toString() ||
          '',
        bus_number:
          driver?.assignedBus?.number ||
          driver?.assigned_bus?.number ||
          driver?.bus?.number ||
          '',
        route_id:
          driver?.assigned_route_id?.toString() ||
          driver?.assignedRoute?.id?.toString() ||
          driver?.assigned_route?.id?.toString() ||
          '',
        route_name:
          driver?.assignedRoute?.name ||
          driver?.assigned_route?.name ||
          driver?.route?.name ||
          '',
        created_at: driver?.created_at || '',
        updated_at: driver?.updated_at || '',
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Create driver
  async createDriver(driverData: Partial<Driver>): Promise<Driver> {
    try {
      const response = await api.post('/admin/drivers', driverData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create driver');
    }
  }

  // Update driver
  async updateDriver(driverId: string, driverData: Partial<Driver>): Promise<Driver> {
    try {
      const response = await api.put(`/admin/drivers/${driverId}`, driverData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update driver');
    }
  }

  // Delete driver
  async deleteDriver(driverId: string): Promise<void> {
    try {
      await api.delete(`/admin/drivers/${driverId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete driver');
    }
  }

  // Update driver status
  async updateDriverStatus(
    driverId: string,
    status: 'active' | 'inactive' | 'on_leave'
  ): Promise<Driver> {
    try {
      const response = await api.patch(`/admin/drivers/${driverId}/status`, { status });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update driver status');
    }
  }

  // Assign bus to driver
  async assignBusToDriver(driverId: string, busId: string): Promise<Driver> {
    try {
      const response = await api.patch(`/admin/drivers/${driverId}/assign-bus`, { bus_id: busId });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to assign bus');
    }
  }

  // Get driver trip history
  async getDriverTripHistory(
    driverId: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<any> {
    try {
      const response = await api.get(`/admin/drivers/${driverId}/trips`, {
        params: { page, per_page: perPage },
      });
      const payload = response.data?.data ?? response.data;

      if (payload && Array.isArray(payload.data)) {
        const trips = payload.data.map((trip: any) => ({
          id: trip.id?.toString() || '',
          route_name: trip.route?.name || trip.route_name || '',
          start_time: trip.start_time || '',
          end_time: trip.end_time || '',
          status: trip.status || '',
          driver_name: trip.driver?.name || '',
        }));

        return { trips, total: payload.total || trips.length };
      }

      if (Array.isArray(payload)) {
        const trips = payload.map((trip: any) => ({
          id: trip.id?.toString() || '',
          route_name: trip.route?.name || trip.route_name || '',
          start_time: trip.start_time || '',
          end_time: trip.end_time || '',
          status: trip.status || '',
          driver_name: trip.driver?.name || '',
        }));
        return { trips, total: trips.length };
      }

      return { trips: [], total: 0 };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return { trips: [], total: 0 };
      }
      return { trips: [], total: 0 };
    }
  }

  // ========== ADMIN METHODS ==========

  // Get all admins
  async getAdmins(
    page: number = 1,
    perPage: number = 20,
    filters?: UserFilters
  ): Promise<UserListResponse<Admin>> {
    try {
      const params: any = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await api.get('/admin/admins', { params });
      const payload = response.data?.data ?? response.data;

      if (payload && Array.isArray(payload.data)) {
        const admins = payload.data.map((admin: any) => ({
          id: admin.id?.toString() || '',
          email: admin.email || '',
          name: admin.name || '',
          role: admin.role || 'viewer',
          status: admin.status || 'active',
          permissions: admin.permissions || [],
          created_at: admin.created_at || '',
          updated_at: admin.updated_at || '',
        }));

        return {
          users: admins,
          total: payload.total || 0,
          current_page: payload.current_page || page,
          per_page: payload.per_page || perPage,
          last_page: payload.last_page || 1,
        };
      }

      if (Array.isArray(payload)) {
        const admins = payload.map((admin: any) => ({
          id: admin.id?.toString() || '',
          email: admin.email || '',
          name: admin.name || '',
          role: admin.role || 'viewer',
          status: admin.status || 'active',
          permissions: admin.permissions || [],
          created_at: admin.created_at || '',
          updated_at: admin.updated_at || '',
        }));

        return {
          users: admins,
          total: admins.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(admins.length / perPage) || 1,
        };
      }

      if (payload && Array.isArray(payload.users)) {
        return payload;
      }

      return {
        users: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty admins list');
        return {
          users: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get single admin
  async getAdminById(adminId: string): Promise<Admin> {
    try {
      const response = await api.get(`/admin/admins/${adminId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Create admin
  async createAdmin(adminData: Partial<Admin>): Promise<Admin> {
    try {
      const response = await api.post('/admin/admins', adminData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create admin');
    }
  }

  // Update admin
  async updateAdmin(adminId: string, adminData: Partial<Admin>): Promise<Admin> {
    try {
      const response = await api.put(`/admin/admins/${adminId}`, adminData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update admin');
    }
  }

  // Delete admin
  async deleteAdmin(adminId: string): Promise<void> {
    try {
      await api.delete(`/admin/admins/${adminId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete admin');
    }
  }

  // Update admin role
  async updateAdminRole(
    adminId: string,
    role: 'super_admin' | 'admin' | 'viewer'
  ): Promise<Admin> {
    try {
      const response = await api.patch(`/admin/admins/${adminId}/role`, { role });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update admin role');
    }
  }
}

export default new UserService();
