const BASE_URL = import.meta.env.DEV ? '/api' : 'https://danielzbog70.lastapp.dev'
const APP_ID = '74c31b9e-6a21-4fe3-b7db-b136797e000e'
const APP_VERSION = '1.0.0'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface UserAnalytics {
  uid?: string
  uuid: string
  launchnumber: number
  os: string
  osversion: string
  appversion: string
}

interface AnalyticsConfig {
  appId: string
  uid?: string
  appVersion?: string
}

class AnalyticsService {
  private isInitialized = false
  private config: AnalyticsConfig
  private cachedOS: string | null = null
  private cachedOSVersion: string | null = null

  constructor(config: AnalyticsConfig) {
    this.config = config
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Initialize analytics and log app launch with basic device info
   */
  async initialize(appId?: string, uid?: string): Promise<void> {
    try {
      // Update config with provided values or use defaults
      if (appId) {
        this.config.appId = appId
      }
      if (uid) {
        this.config.uid = uid
        localStorage.setItem('analytics_uid', uid)
      }

      // Log app launch with basic device info
      await this.logAppLaunch()
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize analytics:', error)
    }
  }

  /**
   * Log app launch event with basic device information
   */
  async logAppLaunch(): Promise<void> {
    try {
      const result = await this.logAnalytics(
        this.config.uid,
        this.getStoredUuid(),
        this.getStoredLaunchNumber()
      )
      if (result.success) {
        console.log('App launch logged successfully')
      } else {
        console.warn('Failed to log app launch:', result.error)
      }
    } catch (error) {
      console.error('Error logging app launch:', error)
    }
  }

  /**
   * Log analytics data to the endpoint
   */
  async logAnalytics(
    uid?: string,
    uuid?: string,
    launchNumber?: number
  ): Promise<ApiResponse<any>> {
    // Generate or retrieve stored values
    const storedUuid = uuid || this.getStoredUuid()
    const storedLaunchNumber = launchNumber || this.getStoredLaunchNumber()
    
    const payload: {
      app_id: string
      uid?: string
      uuid: string
      launchnumber: number
      os: string
      osversion: string
      appversion: string
    } = {
      app_id: this.config.appId,
      uuid: storedUuid,
      launchnumber: storedLaunchNumber,
      os: this.getOperatingSystem(),
      osversion: this.getOSVersion(),
      appversion: this.config.appVersion || APP_VERSION
    }

    // Add UID if provided
    if (uid) {
      payload.uid = uid
    }

    return this.makeRequest('/analytics/log', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Update user ID for analytics
   */
  updateUserId(uid: string): void {
    this.config.uid = uid
    localStorage.setItem('analytics_uid', uid)
  }

  /**
   * Get current user analytics data
   */
  getUserAnalytics(): UserAnalytics {
    return {
      uid: this.config.uid,
      uuid: this.getStoredUuid(),
      launchnumber: this.getStoredLaunchNumber(),
      os: this.getOperatingSystem(),
      osversion: this.getOSVersion(),
      appversion: this.config.appVersion || APP_VERSION
    }
  }

  /**
   * Get stored user ID
   */
  getUserId(): string | null {
    return this.config.uid || localStorage.getItem('analytics_uid')
  }

  // Private utility methods
  private getStoredUuid(): string {
    let uuid = localStorage.getItem('app_uuid')
    if (!uuid) {
      uuid = crypto.randomUUID()
      localStorage.setItem('app_uuid', uuid)
    }
    return uuid
  }

  private getStoredLaunchNumber(): number {
    const stored = localStorage.getItem('app_launch_number')
    if (!stored) {
      localStorage.setItem('app_launch_number', '1')
      return 1
    }
    const number = parseInt(stored, 10) + 1
    localStorage.setItem('app_launch_number', number.toString())
    return number
  }

  private getOperatingSystem(): string {
    if (this.cachedOS) return this.cachedOS
    
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) {
      this.cachedOS = 'Windows'
    } else if (userAgent.includes('Mac')) {
      this.cachedOS = 'macOS'
    } else if (userAgent.includes('Linux')) {
      this.cachedOS = 'Linux'
    } else if (userAgent.includes('Android')) {
      this.cachedOS = 'Android'
    } else if (userAgent.includes('iOS')) {
      this.cachedOS = 'iOS'
    } else {
      this.cachedOS = 'Unknown'
    }
    
    return 'Web'//this.cachedOS
  }

  private getOSVersion(): string {
    if (this.cachedOSVersion) return this.cachedOSVersion
    
    const userAgent = navigator.userAgent
    const match = userAgent.match(/(?:Windows NT|Mac OS X|Linux|Android|iPhone OS)\s*([\d._]+)/)
    this.cachedOSVersion = match ? match[1] : 'Unknown'
    
    return this.cachedOSVersion
  }
}

// Create default analytics service instance
export const analyticsService = new AnalyticsService({
  appId: APP_ID,
  appVersion: APP_VERSION
})

// Export function to create custom analytics service
export const createAnalyticsService = (config: AnalyticsConfig) => {
  return new AnalyticsService(config)
}

export type { UserAnalytics, AnalyticsConfig }