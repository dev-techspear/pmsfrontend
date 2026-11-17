// Static data for project documents / credentials (kept out of the components per constants.md).

export const CREDENTIAL_TYPES = [
    { value: 'Server', label: 'Server' },
    { value: 'Database', label: 'Database' },
    { value: 'ApiKey', label: 'API key' },
    { value: 'Git', label: 'Git / repo' },
    { value: 'Cloud', label: 'Cloud account' },
    { value: 'Application', label: 'Application login' },
    { value: 'Other', label: 'Other' },
] as const;

export const SECRET_AUTO_HIDE_MS = 30_000;
export const DOCUMENT_MAX_MB = 25;
export const DOCUMENT_ACCEPT =
    '.png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.csv,.md,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip';

export const SHARE_COPY = {
    everyone: { title: 'Everyone on this project', hint: 'Anyone who can open the project can see it.' },
    restricted: { title: 'Only specific roles or people', hint: 'Like SharePoint: nobody else can see it, not even by guessing the link.' },
} as const;
