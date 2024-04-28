/* eslint-disable max-len */
export const GOOGLE_DOC_REGEX =
  /(https:\/\/docs\.google\.com\/document\/d)\/(.*?)\/(.*?\?usp=sharing)/;

export const GOOGLE_SHEET_REGEX =
  /(https:\/\/docs\.google\.com\/spreadsheets\/d)\/(.*?)\/(.*?\?usp=sharing)/;

export const GOOGLE_PPT_REGEX =
  /(https:\/\/docs\.google\.com\/presentation\/d)\/(.*?)\//;

export const SUB_DOMAIN_REGEX = /([^a-z0-9\-]){1,265}/g;

export const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{11})/;

export const QUERY_ID_REGEX =
  /(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)/g;

export const QUIZ_CONTENT_RULE_REGEX = /[\r&&&]/gm;

export const QUIZ_BLOCK_REGEX =
  /(&&&[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\n.*\n?(&&&|\s*&&&))|({bl%[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}%lb})/gm;

export const FEEDBACK_RULE_REGEX = /{rr%.*?%rr}/gm;

export const PAGE_BLOCK_REGEX = /(\(\(\([0-9a-f-]+[\s\S]*?\n\(\(\()/g;

export const PAGE_BLOCK_CONTENT_RULE = /[\r(((]/gm;

// Combined regex includes: quizBlock, pageBlock,...
export const MIXES_PAGEBLOCK_QUIZ_REGEX =
  /&&&[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\n.*\n?(&&&|\s*&&&)|{bl%[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}%lb}|(\(\(\([0-9a-f-]+[\s\S]*?\n\(\(\()/g;

export const HIGHLIGHT_RULE_REGEX = /&&.*?&&/gm;
