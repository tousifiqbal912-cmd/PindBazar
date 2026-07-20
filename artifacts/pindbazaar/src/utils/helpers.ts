export const formatPKR = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};
