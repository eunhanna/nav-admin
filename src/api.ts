const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
export const isApiConfigured = Boolean(API_URL)

export type UserRole = 'user' | 'admin'
export interface AuthUser {
  id: string
  email: string
  role: UserRole
}
export interface AuthSession {
  accessToken: string
  user: AuthUser
}
export interface PublicSite {
  id: string
  name: string
  url: string
  category: string
  iconUrl?: string
  fallbackIcon: string
  fallbackColor?: string
  enabled: boolean
  position: number
  createdAt: string
  updatedAt: string
}
export interface AdminSitesPage {
  sites: PublicSite[]
  total: number
  allTotal: number
  page: number
  pageSize: number
  categories: string[]
}
export type AdminSiteInput = Pick<
  PublicSite,
  | 'name'
  | 'url'
  | 'category'
  | 'iconUrl'
  | 'fallbackIcon'
  | 'fallbackColor'
  | 'enabled'
  | 'position'
>

let accessToken = ''
let refreshPromise: Promise<AuthSession> | null = null

function canRefreshAfterUnauthorized(path: string) {
  return ![
    '/auth/refresh',
    '/auth/password/login',
    '/auth/code/verify',
  ].includes(path)
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retriedAfterRefresh = false,
): Promise<T> {
  if (!API_URL) throw new Error('api_not_configured')
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  })
  const body =
    response.status === 204 ? null : await response.json().catch(() => null)
  if (
    response.status === 401 &&
    !retriedAfterRefresh &&
    canRefreshAfterUnauthorized(path)
  ) {
    await restoreSession()
    return request<T>(path, init, true)
  }
  if (!response.ok)
    throw new Error(body?.error ?? `request_failed_${response.status}`)
  return body as T
}
const remember = (session: AuthSession) => {
  accessToken = session.accessToken
  return session
}
export const requestLoginCode = (email: string) =>
  request<{ status: 'accepted' }>('/auth/code/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
export const verifyLoginCode = (email: string, code: string) =>
  request<AuthSession>('/auth/code/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  }).then(remember)
export const loginWithPassword = (email: string, password: string) =>
  request<AuthSession>('/auth/password/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then(remember)
export const setupPassword = (password: string) =>
  request<null>('/auth/password/setup', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
export function restoreSession() {
  if (!refreshPromise) {
    refreshPromise = request<AuthSession>('/auth/refresh', { method: 'POST' })
      .then(remember)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}
export const getCurrentUser = () =>
  request<{ user: AuthUser }>('/me').then((response) => response.user)
export const getAdminSites = ({
  page = 1,
  pageSize = 20,
  query,
  category,
}: {
  page?: number
  pageSize?: number
  query?: string
  category?: string
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (query) params.set('query', query)
  if (category) params.set('category', category)
  return request<Partial<AdminSitesPage> & { sites?: PublicSite[] }>(
    `/admin/sites?${params}`,
  ).then((response) => {
    const sites = response.sites ?? []
    return {
      sites,
      total: response.total ?? sites.length,
      allTotal: response.allTotal ?? sites.length,
      page: response.page ?? page,
      pageSize: response.pageSize ?? pageSize,
      categories:
        response.categories ??
        Array.from(new Set(sites.map((site) => site.category))).sort(),
    } satisfies AdminSitesPage
  })
}
export const getAdminSitesForOrdering = () =>
  request<{ sites: PublicSite[] }>('/admin/sites/order')
export const createAdminSite = (input: AdminSiteInput) =>
  request<PublicSite>('/admin/sites', {
    method: 'POST',
    body: JSON.stringify(input),
  })
export const updateAdminSite = (id: string, input: Partial<AdminSiteInput>) =>
  request<PublicSite>(`/admin/sites/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
export const deleteAdminSite = (id: string) =>
  request<null>(`/admin/sites/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const reorderAdminSites = (
  items: Array<{ id: string; position: number }>,
) =>
  request<{ sites: PublicSite[] }>('/admin/sites/reorder', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
export const toggleAdminSite = (id: string, enabled: boolean) =>
  updateAdminSite(id, { enabled })
export async function logout() {
  try {
    await request<null>('/auth/logout', { method: 'POST' })
  } finally {
    accessToken = ''
  }
}
