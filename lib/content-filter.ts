const PHONE_RE = /(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/
const URL_RE = /(https?:\/\/|www\.)[^\s]+/

export interface ContentFlags {
  contains_phone: boolean
  contains_email: boolean
  contains_external_links: boolean
  flagged_for_review: boolean
}

export function analyzeContent(text: string): ContentFlags {
  const contains_phone = PHONE_RE.test(text)
  const contains_email = EMAIL_RE.test(text)
  const contains_external_links = URL_RE.test(text)
  const flagged_for_review = contains_phone || contains_email || contains_external_links
  return { contains_phone, contains_email, contains_external_links, flagged_for_review }
}
