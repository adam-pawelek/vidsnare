/**
 * Every failure the user can see is reduced to one of these codes. The UI turns
 * a code into a translated, human-readable message.
 */
export const ERROR_CODES = [
  'PRIVATE_VIDEO',
  'VIDEO_UNAVAILABLE',
  'AGE_RESTRICTED',
  'MEMBERS_ONLY',
  'PAID_CONTENT',
  'REGION_BLOCKED',
  'COPYRIGHT_BLOCKED',
  'LIVE_NOT_STARTED',
  'DRM_PROTECTED',
  'BOT_CHECK',
  'RATE_LIMITED',
  'NO_INTERNET',
  'DISK_FULL',
  'PERMISSION_DENIED',
  'FORMAT_UNAVAILABLE',
  'ENGINE_OUTDATED',
  'POSTPROCESSING_FAILED',
  'TOOL_MISSING',
  'INVALID_URL',
  'UNSUPPORTED_URL',
  'CANCELLED',
  'UNKNOWN'
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export interface AppError {
  code: ErrorCode
  /** Whether trying again later has a realistic chance of working. */
  retryable: boolean
  /** The original technical message, for the "copy details" button. */
  detail: string
}
