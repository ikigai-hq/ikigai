const zeroUUIDString = "00000000-0000-0000-0000-000000000000";

export const isZeroUUIDString = (uuidString: string) => {
  return uuidString === zeroUUIDString;
};
