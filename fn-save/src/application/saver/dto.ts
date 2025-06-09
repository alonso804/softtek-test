export type SaverReq = {
  id: string;
  customParams: Record<string, string>;
};

export type SaverRes = { ok: boolean };
