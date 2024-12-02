export const logger = {
  info: (message: string, p0: unknown) => {
    console.log(`[INFO] ${message}`, p0);
  },
  error: (message: string, p0: { data: unknown; error: any }) => {
    console.error(`[ERROR] ${message}`, p0);
  },
};
