export const getRefNumber = (ref: any) => {
  return Number.isInteger(ref) ? ref : 0;
};
