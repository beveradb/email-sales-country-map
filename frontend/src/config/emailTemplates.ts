export interface EmailTemplate {
  id: string
  name: string
  description: string
  subjectQuery: string
  countryRegex: string
  exampleEmail?: {
    subject: string
    bodySnippet: string
    countryMatch: string
  }
  instructions?: string
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'clips4sale',
    name: 'Clips4Sale',
    description: 'Sales notification emails from Clips4Sale platform',
    subjectQuery: 'subject:"You\'ve Made a Sale!" OR subject:"Fwd: You\'ve Made a Sale!"',
    countryRegex: 'Country from IP:\\s*(?:<[^>]*>)?\\s*([^<\\n\\r]+)',
    exampleEmail: {
      subject: "You've Made a Sale!",
      bodySnippet: "Congratulations! You've made a sale...\nCountry from IP: United States\nCustomer email: customer@example.com",
      countryMatch: "United States"
    },
    instructions: 'Searches for emails with "You\'ve Made a Sale!" in the subject line and extracts country information from the email body.'
  },
  {
    id: 'custom',
    name: 'Custom Configuration',
    description: 'Create your own custom email search and parsing rules',
    subjectQuery: '',
    countryRegex: '',
    instructions: 'Define your own subject search query and regular expression pattern to extract country information from your sales emails.'
  }
]

export const getTemplateById = (id: string): EmailTemplate | undefined => {
  return EMAIL_TEMPLATES.find(template => template.id === id)
}

export const getDefaultTemplate = (): EmailTemplate => {
  return EMAIL_TEMPLATES[0] // Clips4Sale as default
}
