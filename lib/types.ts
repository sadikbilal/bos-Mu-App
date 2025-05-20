export type DensityLevel = "low" | "medium" | "high"

export interface Floor {
  id: string
  name: string
  description?: string
  densityLevel: DensityLevel
}

export interface Location {
  id: string
  name: string
  type: string
  currentDensity: DensityLevel
  lastUpdated: string
  totalSeats: number
  availableSeats: number
  entranceQrCode?: string
  exitQrCode?: string
  floors?: Floor[]
  floor?: string
  currentOccupancy?: number
  totalCapacity?: number
  qrCode?: string
}

export interface DensityLog {
  id: string
  locationId: string
  densityLevel: DensityLevel
  timestamp: string
  source: "user" | "ai" | "system"
}

export interface Desk {
  id: string
  locationId: string
  tableNumber: number
  status: "available" | "occupied" | "reserved"
  qrCode?: string
  lastUpdated: string
  isOccupied?: boolean
  currentUser?: string | null
  occupiedAt?: any | null
}

export interface CheckIn {
  id: string
  userId: string
  deskId?: string
  locationId: string
  checkInTime: string
  checkOutTime?: string | null
  breakStartTime?: string | null
  breakEndTime?: string | null
  breakType?: string | null
  status: "active" | "break" | "completed"
}

export interface User {
  id: string
  studentNumber: string
  fullName: string
  email: string
  isActive: boolean
  createdAt: any // Timestamp
  lastLogin: any // Timestamp
  checkIns?: CheckIn[]
}
