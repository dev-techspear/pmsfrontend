export const THEME_COLORS = {
    // Techspear Brand Guidelines Core Tokens
    BRAND_BLUE: '#04436E',
    BRAND_BLUE_DEEP: '#032D5E',
    BRAND_GREEN: '#2F833A',
    BRAND_GREEN_DEEP: '#1F6B2E',
    BRAND_LIME: '#84B424',
    BRAND_LIME_DEEP: '#6D9A1F',
    BRAND_TEAL: '#068799',
    BRAND_TEAL_DEEP: '#04707F',

    INK: '#0B1F33',
    SLATE: '#5B6B7C',
    BORDER: '#E3E9E6',
    MIST: '#F5F8F6',
    BLUE_TINT: '#E6EFF6',
    GREEN_TINT: '#E8F3EA',

    // Status colors
    SUCCESS: '#2F833A',
    INFO: '#04436E',
    WARNING: '#B45309',
    DANGER: '#C62828',

    // Backward-compatible aliases
    TEAL: '#04436E',
    EMERALD: '#2F833A',
    RED: '#C62828',
    ORANGE: '#B45309',
    AMBER: '#B45309',
};

// Section 5 Brand Guidelines: Charts in this order: Blue, Green, Teal, Lime, Slate, then tints
export const BRAND_CHART_COLORS = [
    '#04436E', // Blue
    '#2F833A', // Green
    '#068799', // Teal
    '#84B424', // Lime
    '#5B6B7C', // Slate
    '#E6EFF6', // Blue tint
    '#E8F3EA', // Green tint
];

export const PRIORITY_COLORS: Record<string, string> = {
    critical: '#C62828',
    high: '#B45309',
    medium: '#04436E',
    low: '#2F833A',
    none: '#5B6B7C',
};

export const SEVERITY_COLORS: Record<string, string> = {
    critical: '#C62828',
    high: '#B45309',
    medium: '#04436E',
    low: '#2F833A',
    normal: '#5B6B7C',
    blocker: '#C62828',
    'show stopper': '#8B0000',
};

export const ISSUE_CLASSIFICATIONS = [
    'None', 'Security', 'Crash/Hang', 'Data Loss', 'Performance',
    'UI/UX Usability', 'Other Bugs', 'Feature (New)', 'Enhancement',
];

export const BUG_TYPE_OPTIONS = [
    { label: 'Internal', value: 'Internal' },
    { label: 'External', value: 'External' },
];

export const REPRO_OPTIONS = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
];

export const BILLING_OPTIONS = [
    { label: 'Billable', value: 'Billable' },
    { label: 'Non-Billable', value: 'Non-Billable' },
    { label: 'Internal', value: 'Internal' },
];

export const CACHE_INVALIDATION_RESOURCES = ['tasks', 'issues', 'timelogs', 'milestones'];
export const MUTATION_METHODS = ['post', 'put', 'delete', 'patch'];

export const AUTH_TOKEN_KEY = 'pms_token';
export const AUTH_REFRESH_TOKEN_KEY = 'pms_refresh_token';

export const API_V1_PREFIX = /^\/api\/v1\//;

export const QUERY_KEYS = {
    REPORTS: 'reports',
    PROJECTS: 'projects',
    MASTERS: 'masters',
    TIMELOGS: 'timelogs',
    MILESTONES: 'milestones',
    TASKS: 'tasks',
    ISSUES: 'issues',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const AUTH_ENDPOINTS = {
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
} as const;

export const ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/',
} as const;

export const STORAGE_KEYS = {
    TOKEN: AUTH_TOKEN_KEY,
    REFRESH_TOKEN: AUTH_REFRESH_TOKEN_KEY,
    THEME: 'app-theme',
    USER: 'user',
    USER_DATA: 'user_data',
} as const;

export const EVENTS = {
    TOAST: 'pms:toast',
} as const;

export const PASSWORD_POLICY = {
    MIN_LENGTH: 10,
    MAX_LENGTH: 128,
} as const;

// View-permission levels shown in the role configuration dropdowns. `value` is what is stored
// on the role ('' = no access, saved as false); `label` is what the admin sees.
export const VIEW_LEVEL_OPTIONS = [
    { label: 'No Access', value: '' },
    { label: 'Owned', value: 'O' },
    { label: 'Associated', value: 'A' },
    { label: 'All', value: 'All' },
] as const;

export const VIEW_LEVEL_BADGE_LABELS: Record<string, string> = {
    O: 'Owned',
    A: 'Associated',
    All: 'All',
};

// User status names (ids differ per database, so screens look them up by name).
export const USER_STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PENDING: 'Pending',
} as const;

// Project chat (mirrors the limits enforced by the API in AppConstants.cs).
export const CHAT = {
    HUB_PATH: '/hubs/chat',
    MAX_LENGTH: 4000,
    PAGE_SIZE: 50,
    UNREAD_POLL_MS: 30_000,
    MARK_READ_DEBOUNCE_MS: 800,
    MAX_FILES: 5,
    MAX_FILE_BYTES: 10 * 1024 * 1024,
    ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.txt', '.csv', '.md',
        '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip'],
    INLINE_IMAGE_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    VIEW_PERMISSION: 'chat-view',
    POST_PERMISSION: 'chat-post',
} as const;
