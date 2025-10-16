export type Option = {
  id: string;
  label: string;
  eliminated?: boolean;
};

export type Category = {
  id: string;
  name: string;
  options: Option[];
  locked?: boolean; // becomes true when only 1 option remains
};

export type MashRunResult = {
  winners: Record<string, Option>;        // categoryId -> winning option
  eliminationOrder: Array<{ categoryId: string; option: Option }>;
};